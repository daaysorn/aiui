"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { DesktopIcon, DeviceMobileIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "@/app/(dashboard)/dashboard/settings/actions"
import { Button } from "@/components/ui/button"
import { useSessions } from "@/hooks/use-dashboard-query"
import { queryKeys } from "@/lib/query/keys"

function sessionTitle(session: {
  deviceName: string | null
  browser: string | null
  platform: string | null
}) {
  const parts = [
    session.deviceName,
    session.browser,
    session.platform,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : "Unknown device"
}

function SessionIcon({ device }: { device: string | null }) {
  if (device === "mobile") {
    return <DeviceMobileIcon className="size-4 shrink-0" aria-hidden />
  }
  return <DesktopIcon className="size-4 shrink-0" aria-hidden />
}

function SessionsPanel() {
  const { data: sessions = [], isLoading } = useSessions()
  const queryClient = useQueryClient()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [revokingOthers, startRevokeOthers] = useTransition()

  async function refreshSessions() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
  }

  async function handleRevoke(sessionId: string) {
    setPendingId(sessionId)
    try {
      const result = await revokeSessionAction(sessionId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.message ?? "Session ended.")
      await refreshSessions()
    } finally {
      setPendingId(null)
    }
  }

  function handleRevokeOthers() {
    startRevokeOthers(async () => {
      const result = await revokeOtherSessionsAction()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.message ?? "Other sessions ended.")
      await refreshSessions()
    })
  }

  const otherSessions = sessions.filter((session) => !session.current)

  return (
    <div className="flex max-w-lg flex-col gap-3">
      {otherSessions.length > 0 ? (
        <Button
          variant="secondary"
          className="self-end"
          loading={revokingOthers}
          onClick={handleRevokeOthers}
        >
          Sign out other devices
        </Button>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl bg-muted p-5 text-sm text-muted-foreground">
          <SpinnerGapIcon className="size-4 animate-spin" aria-hidden />
          Loading active sessions…
        </div>
      ) : null}

      {!isLoading && sessions.length === 0 ? (
        <div className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">
          No active sessions found.
        </div>
      ) : null}

      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-start justify-between gap-4 rounded-xl bg-muted p-5"
        >
          <div className="flex min-w-0 gap-3">
            <SessionIcon device={session.device} />
            <div className="min-w-0 flex flex-col gap-1">
              <p className="text-sm font-medium">{sessionTitle(session)}</p>
              <p className="text-xs text-muted-foreground">
                {session.ipAddress ?? "Unknown IP"}
                {session.current ? " · This device" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Last active {new Date(session.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          {session.current ? null : (
            <Button
              variant="ghost"
              size="sm"
              loading={pendingId === session.id}
              disabled={pendingId !== null || revokingOthers}
              onClick={() => handleRevoke(session.id)}
            >
              End
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export { SessionsPanel }
