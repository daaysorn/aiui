"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEveAgent, type EveMessage } from "eve/react"

import { useBillingGate } from "@/hooks/use-billing-gate"
import { CHAT_MESSAGE_CREDIT_COST } from "@/lib/billing/features"
import {
  createWorkspaceThread,
  updateWorkspaceThread,
} from "@/lib/api/dashboard-data"
import {
  loadDashboardChat,
  saveDashboardChat,
  type SavedDashboardChat,
} from "@/lib/chat/dashboard-session-storage"
import { hydrateEveSession } from "@/lib/chat/eve-session-hydrate"
import { threadTitleFromMessage } from "@/lib/chat/thread-title"
import { queryKeys } from "@/lib/query/keys"

export function eveMessageText(message: Pick<EveMessage, "parts">): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export type DashboardChatSendResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "credits" | "busy" | "attachments" }

type UseDashboardChatBootstrapInput = {
  userId: string | undefined
  threadId: string | null
}

export function useDashboardChatBootstrap({
  userId,
  threadId,
}: UseDashboardChatBootstrapInput) {
  const [initial, setInitial] = useState<SavedDashboardChat>({})
  const [ready, setReady] = useState(!threadId)

  useEffect(() => {
    if (!threadId || !userId) {
      setInitial({})
      setReady(true)
      return
    }

    let cancelled = false

    async function load() {
      setReady(false)
      const cached = loadDashboardChat(userId!, threadId!)
      if (cached.events?.length) {
        if (!cancelled) {
          setInitial(cached)
          setReady(true)
        }
        return
      }

      try {
        const { fetchWorkspaceThread } = await import("@/lib/api/dashboard-data")
        const thread = await fetchWorkspaceThread(threadId!)
        if (thread?.eveSessionId) {
          const snapshot = await hydrateEveSession(thread.eveSessionId)
          if (!cancelled) {
            const payload = {
              events: snapshot.events,
              session: snapshot.session,
            }
            setInitial(payload)
            saveDashboardChat(userId!, threadId!, payload)
          }
        } else if (!cancelled) {
          setInitial({})
        }
      } catch {
        if (!cancelled) {
          setInitial({})
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [threadId, userId])

  return useMemo(() => ({ ready, initial }), [ready, initial])
}

type UseDashboardChatInput = {
  userId: string | undefined
  workspaceId: string | null
  threadId: string | null
  initial: SavedDashboardChat
  onThreadCreated?: (threadId: string) => void
}

export function useDashboardChat({
  userId,
  workspaceId,
  threadId,
  initial,
  onThreadCreated,
}: UseDashboardChatInput) {
  const queryClient = useQueryClient()
  const { ensureAccess, recordUsage } = useBillingGate()
  const chargeAfterTurnRef = useRef(false)
  const trackFailureRef = useRef<(() => void) | null>(null)
  const threadIdRef = useRef<string | null>(threadId)
  const createdThreadRef = useRef(false)

  if (threadId && threadIdRef.current !== threadId) {
    threadIdRef.current = threadId
    createdThreadRef.current = true
  }

  const agent = useEveAgent({
    initialEvents: initial.events,
    initialSession: initial.session,
    prepareSend: (input) => ({
      ...input,
      clientContext: {
        surface: "dashboard",
        ...(workspaceId ? { workspaceId } : {}),
        ...(threadIdRef.current ? { threadId: threadIdRef.current } : {}),
      },
    }),
    onError: () => {
      chargeAfterTurnRef.current = false
    },
    onFinish: (snapshot) => {
      const activeThreadId = threadIdRef.current
      if (userId && activeThreadId) {
        saveDashboardChat(userId, activeThreadId, {
          events: snapshot.events,
          session: snapshot.session,
        })

        const sessionId = snapshot.session?.sessionId
        if (sessionId) {
          void updateWorkspaceThread(activeThreadId, {
            eveSessionId: sessionId,
          })
            .then(() =>
              queryClient.invalidateQueries({ queryKey: queryKeys.recentChats })
            )
            .catch(() => {})
        }
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

  const ensureThread = useCallback(
    async (titleSource: string) => {
      if (threadIdRef.current) {
        return threadIdRef.current
      }

      const thread = await createWorkspaceThread(threadTitleFromMessage(titleSource))
      threadIdRef.current = thread.id
      if (!createdThreadRef.current) {
        createdThreadRef.current = true
        onThreadCreated?.(thread.id)
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.recentChats })
      return thread.id
    },
    [onThreadCreated, queryClient]
  )

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

      try {
        await ensureThread(trimmed)
      } catch {
        return { ok: false, reason: "busy" }
      }

      chargeAfterTurnRef.current = true
      await agent.send(trimmed)
      return { ok: true }
    },
    [agent, ensureAccess, ensureThread, isBusy]
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
