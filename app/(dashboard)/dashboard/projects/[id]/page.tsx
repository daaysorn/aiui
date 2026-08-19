import { notFound } from "next/navigation"

import { serverApiFetch } from "@/lib/api/server-fetch"
import type { ProjectDetail } from "@/lib/api/types"
import { ProjectDetailView } from "@/views/dashboard/projectDetailView"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  let project: ProjectDetail

  try {
    project = await serverApiFetch<ProjectDetail>(`/v1/projects/${id}`)
  } catch {
    notFound()
  }

  return <ProjectDetailView project={project} />
}
