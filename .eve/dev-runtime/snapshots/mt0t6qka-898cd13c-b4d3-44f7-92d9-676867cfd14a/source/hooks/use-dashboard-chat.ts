"use client"

import { useCallback, useMemo, useRef } from "react"
import { useEveAgent, type EveMessage } from "eve/react"

import { useBillingGate } from "@/hooks/use-billing-gate"
import { CHAT_MESSAGE_CREDIT_COST } from "@/lib/billing/features"
import {
  loadDashboardChat,
  saveDashboardChat,
  type SavedDashboardChat,
} from "@/lib/chat/dashboard-session-storage"

export function eveMessageText(message: Pick<EveMessage, "parts">): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export type DashboardChatSendResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "credits" | "busy" | "attachments" }

type UseDashboardChatInput = {
  userId: string | undefined
  workspaceId: string | null
  /** Bump to remount Eve state after "New conversation". */
  sessionEpoch?: number
}

export function useDashboardChat({
  userId,
  workspaceId,
  sessionEpoch = 0,
}: UseDashboardChatInput) {
  const { ensureAccess, recordUsage } = useBillingGate()
  const chargeAfterTurnRef = useRef(false)
  const trackFailureRef = useRef<(() => void) | null>(null)

  const saved = useMemo((): SavedDashboardChat => {
    if (!userId || sessionEpoch > 0) {
      return {}
    }
    return loadDashboardChat(userId)
  }, [sessionEpoch, userId])

  const agent = useEveAgent({
    initialEvents: saved.events,
    initialSession: saved.session,
    prepareSend: (input) => ({
      ...input,
      clientContext: {
        surface: "dashboard",
        ...(workspaceId ? { workspaceId } : {}),
      },
    }),
    onError: () => {
      chargeAfterTurnRef.current = false
    },
    onFinish: (snapshot) => {
      if (userId) {
        saveDashboardChat(userId, {
          events: snapshot.events,
          session: snapshot.session,
        })
      }

      if (!chargeAfterTurnRef.current) {
        return
      }

      chargeAfterTurnRef.current = false

      if (snapshot.status === "ready" && !snapshot.error) {
        void recordUsage({ value: CHAT_MESSAGE_CREDIT_COST }).catch(() => {
          trackFailureRef.current?.()
        })
      }
    },
  })

  const isBusy = agent.status === "submitted" || agent.status === "streaming"

  const sendMessage = useCallback(
    async (text: string, options?: { hasAttachments?: boolean }): Promise<DashboardChatSendResult> => {
      const trimmed = text.trim()
      if (options?.hasAttachments) {
        return { ok: false, reason: "attachments" }
      }
      if (!trimmed) {
        return { ok: false, reason: "empty" }
      }
      if (isBusy) {
        return { ok: false, reason: "busy" }
      }

      const allowed = await ensureAccess({
        requiredBalance: CHAT_MESSAGE_CREDIT_COST,
      })
      if (!allowed) {
        return { ok: false, reason: "credits" }
      }

      chargeAfterTurnRef.current = true
      await agent.send(trimmed)
      return { ok: true }
    },
    [agent, ensureAccess, isBusy]
  )

  const regenerate = useCallback(async (): Promise<DashboardChatSendResult> => {
    const lastUser = [...agent.data.messages].reverse().find((message) => message.role === "user")
    if (!lastUser) {
      return { ok: false, reason: "empty" }
    }

    return sendMessage(eveMessageText(lastUser))
  }, [agent.data.messages, sendMessage])

  const registerTrackFailure = useCallback((handler: (() => void) | null) => {
    trackFailureRef.current = handler
  }, [])

  return {
    agent,
    messages: agent.data.messages,
    status: agent.status,
    error: agent.error,
    isBusy,
    sendMessage,
    regenerate,
    resetSession: agent.reset,
    registerTrackFailure,
  }
}
