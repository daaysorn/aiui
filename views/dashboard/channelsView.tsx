"use client"

import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { useChannels } from "@/hooks/use-dashboard-query"

export function ChannelsView() {
  const { data: channels, isPending } = useChannels()

  if (isPending || !channels) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardSection
      title="Channels"
      description="Your saved chat channels."
      action={
        <Button render={<Link href="/dashboard/channels/new" />}>
          New channel
        </Button>
      }
    >
      {channels.length === 0 ? (
        <div className="rounded-xl bg-muted p-8 text-center">
          <p className="text-sm text-muted-foreground">No channels yet.</p>
          <Button className="mt-4" render={<Link href="/dashboard/channels/new" />}>
            Create your first channel
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {channels.map((channel) => (
            <li key={channel.id}>
              <Link
                href={`/dashboard/channels/${channel.id}`}
                className="block rounded-xl bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <p className="font-medium">{channel.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  )
}
