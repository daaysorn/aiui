"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { DesktopIcon, DeviceMobileIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "@/app/(dashboard)/dashboard/settings/actions"
import {
  SettingsCard,
  SettingsEmpty,
  SettingsLoading,
  SettingsPanel,
  SettingsRow,
} from "@/components/dashboard/settings-ui"
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
    return <DeviceMobileIcon className="size-4" aria-hidden />
  }
  return <DesktopIcon className="size-4" aria-hidden />
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
    <SettingsPanel>
      {otherSessions.length > 0 ? (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            loading={revokingOthers}
            onClick={handleRevokeOthers}
          >
            Sign out other devices
          </Button>
        </div>
      ) : null}

      {isLoading ? <SettingsLoading label="Loading active sessions…" /> : null}

      {!isLoading && sessions.length === 0 ? (
        <SettingsEmpty label="No active sessions found." />
      ) : null}

      {!isLoading && sessions.length > 0 ? (
        <SettingsCard title="Active sessions" description="Devices signed into daaysorn.">
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <SettingsRow
                key={session.id}
                leading={<SessionIcon device={session.device} />}
                title={sessionTitle(session)}
                description={[
                  session.ipAddress ?? "Unknown IP",
                  session.current ? "This device" : null,
                  `Last active ${new Date(session.updatedAt).toLocaleString()}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                action={
                  session.current ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={pendingId === session.id}
                      disabled={pendingId !== null || revokingOthers}
                      onClick={() => handleRevoke(session.id)}
                    >
                      End
                    </Button>
                  )
                }
              />
            ))}
          </div>
        </SettingsCard>
      ) : null}
    </SettingsPanel>
  )
}

export { SessionsPanel }
