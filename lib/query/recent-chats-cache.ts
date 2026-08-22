import type { QueryClient } from "@tanstack/react-query"

import type { RecentChat, WorkspaceThread } from "@/lib/api/types"
import { queryKeys } from "@/lib/query/keys"

/** Insert or bump a workspace thread in the Recents cache without a network refetch. */
export function upsertWorkspaceRecentChat(
  queryClient: QueryClient,
  thread: Pick<WorkspaceThread, "id" | "title" | "workspaceId" | "updatedAt">
) {
  const next: RecentChat = {
    id: thread.id,
    title: thread.title,
    scope: "workspace",
    parentId: thread.workspaceId,
    parentName: "Workspace",
    updatedAt: thread.updatedAt,
  }

  queryClient.setQueryData<RecentChat[]>(queryKeys.recentChats, (previous) => {
    const list = previous ?? []
    const without = list.filter(
      (chat) => !(chat.scope === "workspace" && chat.id === next.id)
    )
    return [next, ...without]
  })
}

/** Patch a Recents title in-place (e.g. after AI rename). */
export function patchRecentChatTitle(
  queryClient: QueryClient,
  input: {
    id: string
    scope: RecentChat["scope"]
    title: string
    updatedAt?: string
  }
) {
  queryClient.setQueryData<RecentChat[]>(queryKeys.recentChats, (previous) => {
    if (!previous) return previous
    return previous.map((chat) =>
      chat.scope === input.scope && chat.id === input.id
        ? {
            ...chat,
            title: input.title,
            updatedAt: input.updatedAt ?? new Date().toISOString(),
          }
        : chat
    )
  })
}
