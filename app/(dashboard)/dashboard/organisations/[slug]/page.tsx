import { OrganisationDetailView } from "@/views/dashboard/organisationDetailView"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function OrganisationDetailPage({ params }: PageProps) {
  const { slug } = await params
  return <OrganisationDetailView slug={slug} />
}
