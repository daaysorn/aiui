import { apiFetch } from "@/lib/api/fetch"
import type { Project, ProjectDetail } from "@/lib/api/types"

export async function listProjects(): Promise<{ projects: Project[] }> {
  return apiFetch<{ projects: Project[] }>("/v1/projects")
}

export async function getProject(id: string): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/v1/projects/${id}`)
}

export async function createProject(body: {
  name: string
  brief?: string
}): Promise<Project> {
  return apiFetch<Project>("/v1/projects", {
    method: "POST",
    json: body,
  })
}
