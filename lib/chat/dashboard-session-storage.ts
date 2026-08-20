import type { ClientSessionState, MessageStreamEvent } from "eve/client"

const STORAGE_PREFIX = "daaybot:dashboard-chat:"

export type SavedDashboardChat = {
  events?: readonly MessageStreamEvent[]
  session?: ClientSessionState
}

export function dashboardChatStorageKey(
  userId: string,
  threadId: string
): string {
  return `${STORAGE_PREFIX}${userId}:${threadId}`
}

export function loadDashboardChat(
  userId: string | undefined,
  threadId: string | undefined
): SavedDashboardChat {
  if (!userId || !threadId || typeof window === "undefined") {
    return {}
  }

  try {
    const raw = sessionStorage.getItem(dashboardChatStorageKey(userId, threadId))
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as SavedDashboardChat
  } catch {
    return {}
  }
}

export function saveDashboardChat(
  userId: string,
  threadId: string,
  payload: SavedDashboardChat
): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.setItem(
      dashboardChatStorageKey(userId, threadId),
      JSON.stringify(payload)
    )
  } catch {
    // Private mode or quota exceeded.
  }
}

export function clearDashboardChat(userId: string, threadId: string): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.removeItem(dashboardChatStorageKey(userId, threadId))
  } catch {
    // ignore
  }
}
