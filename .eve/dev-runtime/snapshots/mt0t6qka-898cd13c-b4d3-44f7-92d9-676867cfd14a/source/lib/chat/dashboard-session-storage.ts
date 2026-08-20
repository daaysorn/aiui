import type { ClientSessionState, MessageStreamEvent } from "eve/client"

const STORAGE_PREFIX = "daaybot:dashboard-chat:"

export type SavedDashboardChat = {
  events?: readonly MessageStreamEvent[]
  session?: ClientSessionState
}

export function dashboardChatStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`
}

export function loadDashboardChat(userId: string | undefined): SavedDashboardChat {
  if (!userId || typeof window === "undefined") {
    return {}
  }

  try {
    const raw = sessionStorage.getItem(dashboardChatStorageKey(userId))
    if (!raw) {
      return {}
    }
    return JSON.parse(raw) as SavedDashboardChat
  } catch {
    return {}
  }
}

export function saveDashboardChat(userId: string, payload: SavedDashboardChat): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.setItem(dashboardChatStorageKey(userId), JSON.stringify(payload))
  } catch {
    // Private mode or quota exceeded.
  }
}

export function clearDashboardChat(userId: string): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    sessionStorage.removeItem(dashboardChatStorageKey(userId))
  } catch {
    // ignore
  }
}
