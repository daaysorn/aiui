"use server"

import { apiRequestOrThrow } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import type {
  BillingPlan,
  CatalogItem,
  CatalogKind,
  LinkedAccount,
  Project,
  ProjectDetail,
  RecentChat,
  TransactionPage,
  UserOverview,
  UserSession,
  WorkspaceThread,
} from "@/lib/api/types"
import { getUserOverview } from "@/lib/session"

export async function fetchUserOverview(): Promise<UserOverview> {
  const overview = await getUserOverview()
  if (!overview) {
    throw new Error("Unauthorized")
  }
  return overview
}

export async function fetchProjects(): Promise<Project[]> {
  const result = await serverApiRequest<{ projects: Project[] }>("/v1/projects")
  return result.projects
}

export async function fetchProject(id: string): Promise<ProjectDetail | null> {
  try {
    return await serverApiRequest<ProjectDetail>(`/v1/projects/${id}`)
  } catch {
    return null
  }
}

export async function fetchBillingPlans(): Promise<BillingPlan[]> {
  const result = await apiRequestOrThrow<{ plans: BillingPlan[] }>(
    "/v1/billing/plans"
  )
  return result.plans ?? []
}

export async function fetchCatalog(kind: CatalogKind): Promise<CatalogItem[]> {
  const params = new URLSearchParams({ kind })
  const result = await serverApiRequest<{ items: CatalogItem[] }>(
    `/v1/catalog?${params.toString()}`
  )
  return result.items
}

export async function fetchRecentChats(): Promise<RecentChat[]> {
  const result = await serverApiRequest<{ recents: RecentChat[] }>(
    "/v1/workspace/recents"
  )
  return result.recents ?? []
}

export async function fetchWorkspaceThread(
  threadId: string
): Promise<WorkspaceThread | null> {
  try {
    return await serverApiRequest<WorkspaceThread>(
      `/v1/workspace/threads/${threadId}`
    )
  } catch {
    return null
  }
}

export async function createWorkspaceThread(
  title: string
): Promise<WorkspaceThread> {
  return serverApiRequest<WorkspaceThread>("/v1/workspace/threads", {
    method: "POST",
    json: { title },
  })
}

export async function updateWorkspaceThread(
  threadId: string,
  patch: { title?: string; eveSessionId?: string | null; status?: string }
): Promise<WorkspaceThread> {
  return serverApiRequest<WorkspaceThread>(`/v1/workspace/threads/${threadId}`, {
    method: "PATCH",
    json: patch,
  })
}

export async function updateProjectThread(
  projectId: string,
  threadId: string,
  patch: { title?: string; eveSessionId?: string | null; status?: string }
): Promise<WorkspaceThread> {
  return serverApiRequest<WorkspaceThread>(
    `/v1/projects/${projectId}/threads/${threadId}`,
    {
      method: "PATCH",
      json: patch,
    }
  )
}

export async function renameRecentChat(
  chat: Pick<RecentChat, "id" | "scope" | "parentId">,
  title: string
): Promise<void> {
  if (chat.scope === "workspace") {
    await updateWorkspaceThread(chat.id, { title })
    return
  }
  await updateProjectThread(chat.parentId, chat.id, { title })
}

export async function deleteWorkspaceThread(threadId: string): Promise<void> {
  await serverApiRequest(`/v1/workspace/threads/${threadId}`, {
    method: "DELETE",
  })
}

export async function deleteProjectThread(
  projectId: string,
  threadId: string
): Promise<void> {
  await serverApiRequest(`/v1/projects/${projectId}/threads/${threadId}`, {
    method: "DELETE",
  })
}

export async function clearRecentChats(): Promise<void> {
  await serverApiRequest("/v1/workspace/recents", {
    method: "DELETE",
  })
}

export async function deleteRecentChat(chat: {
  id: string
  scope: "workspace" | "project"
  parentId: string
}): Promise<void> {
  if (chat.scope === "workspace") {
    await deleteWorkspaceThread(chat.id)
    return
  }
  await deleteProjectThread(chat.parentId, chat.id)
}

export async function fetchLinkedAccounts(): Promise<LinkedAccount[]> {
  const result = await serverApiRequest<LinkedAccount[]>("/v1/user/accounts")
  return Array.isArray(result) ? result : []
}

export async function fetchSessions(): Promise<UserSession[]> {
  const result = await serverApiRequest<UserSession[]>("/v1/user/sessions")
  return Array.isArray(result) ? result : []
}

export async function fetchCreditTransactions(input?: {
  workspaceId?: string | null
  limit?: number
}): Promise<TransactionPage> {
  const params = new URLSearchParams()
  params.set("limit", String(input?.limit ?? 20))
  params.set("offset", "0")
  if (input?.workspaceId) {
    params.set("workspaceId", input.workspaceId)
  }
  return serverApiRequest<TransactionPage>(
    `/v1/transactions?${params.toString()}`
  )
}
