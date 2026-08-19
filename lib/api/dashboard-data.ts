"use server"

import { serverApiRequest } from "@/lib/api/server-fetch"
import type { Project, ProjectDetail, UserOverview } from "@/lib/api/types"
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
