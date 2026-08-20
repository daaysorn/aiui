export function threadTitleFromMessage(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ")
  if (!normalized) {
    return "New chat"
  }
  if (normalized.length <= 60) {
    return normalized
  }
  return `${normalized.slice(0, 57)}...`
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
