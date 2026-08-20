const LEADING_FILLER =
  /^(?:hey|hi|hello|yo|please|pls|can you|could you|would you|will you|i want to|i need to|i'd like to|im trying to|i'm trying to|help me|assist me)\b[\s,]*/i

const TRAILING_FILLER =
  /(?:\s+(?:please|thanks|thank you|thx))[.!?]*$/i

function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function firstClause(text: string): string {
  const match = text.match(/^(.+?(?:[.!?]|[;:]|\n|$))/)
  return (match?.[1] ?? text).trim()
}

function trimAtWordBoundary(text: string, max: number): string {
  if (text.length <= max) {
    return text
  }

  const slice = text.slice(0, max + 1)
  const lastSpace = slice.lastIndexOf(" ")
  const clipped = (lastSpace > 24 ? slice.slice(0, lastSpace) : text.slice(0, max)).trim()
  return clipped.replace(/[,:;.-]+$/, "")
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

  normalized = firstClause(normalized)
  normalized = normalized.replace(LEADING_FILLER, "").trim()
  normalized = normalized.replace(TRAILING_FILLER, "").trim()
  normalized = normalized.replace(/^["'`]+|["'`]+$/g, "").trim()

  if (!normalized) {
    const fallback = firstClause(text.trim().replace(/\s+/g, " "))
    return capitalize(trimAtWordBoundary(fallback, 48)) || "New chat"
  }

  // Drop a trailing question mark for cleaner sidebar labels when short.
  if (normalized.length <= 48 && normalized.endsWith("?")) {
    return capitalize(normalized)
  }

  return capitalize(trimAtWordBoundary(normalized.replace(/[.!?]+$/, ""), 48))
}

export function recentChatHref(chat: {
  scope: "workspace" | "project"
  id: string
  parentId: string
}): string {
  if (chat.scope === "workspace") {
    return `/dashboard?thread=${chat.id}`
  }
  return `/dashboard/projects/${chat.parentId}`
}
