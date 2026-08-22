"use client"

import { useQueryClient } from "@tanstack/react-query"
import { createDataUrlFilePart } from "eve/client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEveAgent, type EveMessage } from "eve/react"
import type { UserContent } from "ai"

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
import { prepareChatAttachment } from "@/lib/chat/prepare-attachment"
import { summarizeThreadTitle } from "@/lib/chat/summarize-thread-title"
import { threadTitleFromMessage } from "@/lib/chat/thread-title"
import {
  patchRecentChatTitle,
  upsertWorkspaceRecentChat,
} from "@/lib/query/recent-chats-cache"

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

/** Threads created in this tab — skip remount hydrate that would kill the live agent. */
const liveCreatedThreadIds = new Set<string>()

function markLiveCreatedThread(threadId: string) {
  liveCreatedThreadIds.add(threadId)
  window.setTimeout(() => {
    liveCreatedThreadIds.delete(threadId)
  }, 60_000)
}

export function eveMessageText(message: Pick<EveMessage, "parts">): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export type DashboardChatSendResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "credits" | "busy" | "too_large" }

type UseDashboardChatBootstrapInput = {
  userId: string | undefined
  threadId: string | null
}

export function useDashboardChatBootstrap({
  userId,
  threadId,
}: UseDashboardChatBootstrapInput) {
  const [initial, setInitial] = useState<SavedDashboardChat>(() => {
    if (!threadId || !userId) return {}
    return loadDashboardChat(userId, threadId)
  })
  const [ready, setReady] = useState(() => {
    if (!threadId || !userId) return true
    const cached = loadDashboardChat(userId, threadId)
    return Boolean(cached.events?.length)
  })
  const previousThreadRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const previous = previousThreadRef.current
    previousThreadRef.current = threadId

    if (!threadId || !userId) {
      setInitial({})
      setReady(true)
      return
    }

    // Same panel: first message created this thread — keep the live agent.
    // Do not skip when previous is undefined (fresh mount / Recents navigation).
    if (previous === null && threadId) {
      setReady(true)
      return
    }

    // Thread was just created in this tab (URL race remount) — do not hydrate-skel.
    if (liveCreatedThreadIds.has(threadId)) {
      setReady(true)
      return
    }

    if (previous === threadId) {
      return
    }

    let cancelled = false

    async function load() {
      const cached = loadDashboardChat(userId!, threadId!)
      if (cached.events?.length) {
        if (!cancelled) {
          setInitial(cached)
          setReady(true)
        }
        return
      }

      // Only show the chat skeleton when we truly have nothing to render.
      if (!cancelled) {
        setInitial({})
        setReady(false)
      }

      try {
        const { fetchWorkspaceThread } = await import("@/lib/api/dashboard-data")
        const thread = await fetchWorkspaceThread(threadId!)
        if (thread?.eveSessionId) {
          const snapshot = await hydrateEveSession(thread.eveSessionId, {
            timeoutMs: 8_000,
          })
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

async function buildUserContent(
  text: string,
  files: File[]
): Promise<UserContent | string> {
  if (files.length === 0) {
    return text
  }

  const prepared = await Promise.all(files.map((file) => prepareChatAttachment(file)))

  const parts: UserContent = []
  if (text) {
    parts.push({ type: "text", text })
  }

  for (const file of prepared) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    parts.push(
      createDataUrlFilePart({
        bytes,
        mediaType: file.type || "application/octet-stream",
        filename: file.name,
      })
    )
  }

  return parts
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
  const { localAllowed, recordUsage } = useBillingGate()
  const [isPendingSend, setIsPendingSend] = useState(false)
  const chargeAfterTurnRef = useRef(false)
  const trackFailureRef = useRef<(() => void) | null>(null)
  const threadIdRef = useRef<string | null>(threadId)
  const creatingThreadRef = useRef<Promise<string> | null>(null)
  /** First-message source for AI Recents title (cleared after one attempt). */
  const pendingAiTitleRef = useRef<{
    threadId: string
    source: string
  } | null>(null)

  if (threadId && threadIdRef.current !== threadId) {
    threadIdRef.current = threadId
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
      void (async () => {
        if (creatingThreadRef.current) {
          await creatingThreadRef.current.catch(() => null)
        }

        const activeThreadId = threadIdRef.current
        if (userId && activeThreadId) {
          saveDashboardChat(userId, activeThreadId, {
            events: snapshot.events,
            session: snapshot.session,
          })

          const sessionId = snapshot.session?.sessionId
          if (sessionId) {
            // Persist session id only — Recents list does not need a refetch.
            void updateWorkspaceThread(activeThreadId, {
              eveSessionId: sessionId,
            }).catch(() => {})
          }
        }

        const pendingTitle = pendingAiTitleRef.current
        if (
          pendingTitle &&
          pendingTitle.threadId === activeThreadId &&
          snapshot.status === "ready" &&
          !snapshot.error
        ) {
          pendingAiTitleRef.current = null
          void summarizeThreadTitle(pendingTitle.source)
            .then((title) => {
              if (
                !title ||
                title === threadTitleFromMessage(pendingTitle.source)
              ) {
                return
              }
              patchRecentChatTitle(queryClient, {
                id: pendingTitle.threadId,
                scope: "workspace",
                title,
              })
              return updateWorkspaceThread(pendingTitle.threadId, {
                title,
              }).catch(() => {})
            })
            .catch(() => {})
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
      })()
    },
  })

  const isBusy =
    isPendingSend ||
    agent.status === "submitted" ||
    agent.status === "streaming"

  const ensureThread = useCallback(
    (titleSource: string) => {
      if (threadIdRef.current) {
        return Promise.resolve(threadIdRef.current)
      }
      if (creatingThreadRef.current) {
        return creatingThreadRef.current
      }

      const provisionalTitle = threadTitleFromMessage(titleSource || "New chat")
      creatingThreadRef.current = createWorkspaceThread(provisionalTitle)
        .then((thread) => {
          threadIdRef.current = thread.id
          pendingAiTitleRef.current = {
            threadId: thread.id,
            source: titleSource || "New chat",
          }
          markLiveCreatedThread(thread.id)
          onThreadCreated?.(thread.id)
          upsertWorkspaceRecentChat(queryClient, thread)
          return thread.id
        })
        .finally(() => {
          creatingThreadRef.current = null
        })

      return creatingThreadRef.current
    },
    [onThreadCreated, queryClient]
  )

  const sendMessage = useCallback(
    async (
      text: string,
      options?: { files?: File[] }
    ): Promise<DashboardChatSendResult> => {
      const trimmed = text.trim()
      const files = options?.files ?? []
      if (!trimmed && files.length === 0) {
        return { ok: false, reason: "empty" }
      }
      if (isBusy) {
        return { ok: false, reason: "busy" }
      }
      if (files.some((file) => file.size > MAX_ATTACHMENT_BYTES)) {
        return { ok: false, reason: "too_large" }
      }

      if (
        !localAllowed({
          requiredBalance: CHAT_MESSAGE_CREDIT_COST,
        })
      ) {
        return { ok: false, reason: "credits" }
      }

      setIsPendingSend(true)
      chargeAfterTurnRef.current = true

      const titleSource = trimmed || files[0]?.name || "New chat"
      // Create the Nest thread in parallel; do not block the Eve turn on it.
      const threadPromise = ensureThread(titleSource)
      void threadPromise.catch(() => {})

      try {
        const content = await buildUserContent(trimmed, files)
        await agent.send(content)
        return { ok: true }
      } catch (error) {
        chargeAfterTurnRef.current = false
        throw error
      } finally {
        setIsPendingSend(false)
      }
    },
    [agent, ensureThread, isBusy, localAllowed]
  )

  const regenerate = useCallback(async (): Promise<DashboardChatSendResult> => {
    const lastUser = [...agent.data.messages]
      .reverse()
      .find((message) => message.role === "user")
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
