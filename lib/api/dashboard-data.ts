"use server"

import { apiRequestOrThrow } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import type {
  BillingPlan,
  CatalogItem,
  CatalogKind,
  Project,
  ProjectDetail,
  ProjectThread,
  RecentChat,
  UserOverview,
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
  const projects = await fetchProjects()
  const lists = await Promise.all(
    projects.map(async (project) => {
      try {
        const result = await serverApiRequest<{ threads: ProjectThread[] }>(
          `/v1/projects/${project.id}/threads`
        )
        return result.threads.map((thread) => ({
          id: thread.id,
          title: thread.title,
          projectId: project.id,
          projectName: project.name,
          updatedAt: thread.updatedAt,
        }))
      } catch {
        return []
      }
    })
  )

  return lists
    .flat()
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
}
