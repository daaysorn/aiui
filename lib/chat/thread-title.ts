const LEADING_FILLER =
  /^(?:hey|hi|hello|yo|please|pls|can you|could you|would you|will you|i want to|i need to|i'd like to|im trying to|i'm trying to|help me|assist me)\b[\s,]*/i

const TRAILING_FILLER =
  /(?:\s+(?:please|thanks|thank you|thx))[.!?]*$/i

const MIN_TITLE_WORDS = 2
const MAX_TITLE_WORDS = 6

function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function firstClause(text: string): string {
  // Do not treat mid-token dots (Next.js, e.g.) as sentence ends.
  const match = text.match(/^(.+?(?:[.!?](?:\s|$)|[;:\n]|$))/)
  return (match?.[1] ?? text).trim()
}

function stripFillers(text: string): string {
  let normalized = text
  for (let i = 0; i < 4; i += 1) {
    const next = normalized
      .replace(LEADING_FILLER, "")
      .replace(TRAILING_FILLER, "")
      .trim()
    if (next === normalized) {
      break
    }
    normalized = next
  }
  return normalized.replace(/^["'`]+|["'`]+$/g, "").trim()
}

function wordsOf(text: string): string[] {
  return text
    .replace(/[.!?]+$/g, "")
    .split(/\s+/)
    .map((word) => word.replace(/^["'`([{]+|["'`)\]},:;]+$/g, ""))
    .filter(Boolean)
}

/**
 * Sidebar titles: 2–6 words when the prompt has enough content.
 * Single-word prompts stay one word; empty falls back to "New chat".
 */
function clampTitleWords(text: string): string {
  const words = wordsOf(text)
  if (words.length === 0) {
    return ""
  }
  if (words.length === 1) {
    return words[0]
  }
  return words.slice(0, Math.min(MAX_TITLE_WORDS, words.length)).join(" ")
}

/**
 * Turns the first user message into a short recent-chat title.
 * Prefer topic wording over a raw truncation of the full prompt.
 */
export function threadTitleFromMessage(text: string): string {
  let normalized = text.trim().replace(/\s+/g, " ")
  if (!normalized) {
    return "New chat"
  }

  normalized = stripFillers(firstClause(normalized))

  if (!normalized) {
    const fallback = clampTitleWords(firstClause(text.trim().replace(/\s+/g, " ")))
    return capitalize(fallback) || "New chat"
  }

  const titled = clampTitleWords(normalized)
  if (!titled) {
    return "New chat"
  }

  // Prefer at least two words when the raw first clause still has them.
  if (wordsOf(titled).length < MIN_TITLE_WORDS) {
    const fromRaw = clampTitleWords(firstClause(text.trim().replace(/\s+/g, " ")))
    if (wordsOf(fromRaw).length >= MIN_TITLE_WORDS) {
      return capitalize(fromRaw)
    }
  }

  return capitalize(titled)
}

export function recentChatHref(chat: {
  scope: "workspace" | "project"
  id: string
  parentId: string
}): string {
  if (chat.scope === "workspace") {
    return `/dashboard/chat/${chat.id}`
  }
  return `/dashboard/projects/${chat.parentId}`
}

/** Client-only: clear active dashboard thread without a Next soft navigation. */
export const DASHBOARD_NEW_CHAT_EVENT = "daaybot:dashboard-new-chat"

export function workspaceChatPath(threadId: string): string {
  return `/dashboard/chat/${threadId}`
}

export function threadIdFromDashboardPath(pathname: string): string | null {
  const match = /^\/dashboard\/chat\/([^/]+)$/.exec(pathname)
  return match?.[1] ?? null
}
