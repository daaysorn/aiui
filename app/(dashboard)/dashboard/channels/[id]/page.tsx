import { ChannelDetailView } from "@/views/dashboard/channelDetailView"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ChannelDetailPage({ params }: PageProps) {
  const { id } = await params
  return <ChannelDetailView channelId={id} />
}
