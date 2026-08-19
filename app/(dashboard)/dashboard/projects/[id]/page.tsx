import { ProjectDetailView } from "@/views/dashboard/projectDetailView"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  return <ProjectDetailView projectId={id} />
}
