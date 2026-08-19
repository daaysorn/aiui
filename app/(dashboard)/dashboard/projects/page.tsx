import { redirect } from "next/navigation"

import { serverApiFetch } from "@/lib/api/server-fetch"
import type { Project } from "@/lib/api/types"
import { ProjectsView } from "@/views/dashboard/projectsView"

export default async function ProjectsPage() {
  let projects: Project[]
  try {
    const result = await serverApiFetch<{ projects: Project[] }>("/v1/projects")
    projects = result.projects
  } catch {
    redirect("/auth/sign-in")
  }

  return <ProjectsView projects={projects} />
}
