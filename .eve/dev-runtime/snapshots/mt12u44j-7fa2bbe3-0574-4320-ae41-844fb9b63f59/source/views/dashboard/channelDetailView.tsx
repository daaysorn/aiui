"use client"

import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { useChannel } from "@/hooks/use-dashboard-query"

export function ChannelDetailView({ channelId }: { channelId: string }) {
  const { data: channel, isPending } = useChannel(channelId)

  if (isPending) {
    return <DashboardSkeleton />
  }

  if (!channel) {
    return (
      <DashboardSection
        title="Channel not found"
        description="It may have been removed."
        action={
          <Button variant="secondary" render={<Link href="/dashboard/channels" />}>
            All channels
          </Button>
        }
      />
    )
  }

  return (
    <DashboardSection
      title={channel.name}
      description="Your saved chat channel."
      action={
        <Button variant="secondary" render={<Link href="/dashboard/channels" />}>
          All channels
        </Button>
      }
    />
  )
}
