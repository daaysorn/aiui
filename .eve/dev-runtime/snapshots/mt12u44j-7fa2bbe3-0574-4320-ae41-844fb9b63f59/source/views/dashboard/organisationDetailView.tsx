"use client"

import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { useUserOverview } from "@/hooks/use-dashboard-query"

export function OrganisationDetailView({ slug }: { slug: string }) {
  const { data: overview, isPending } = useUserOverview()
  const organisation = overview?.organizations.find((item) => item.slug === slug)

  if (isPending) {
    return <DashboardSkeleton />
  }

  if (!organisation) {
    return (
      <DashboardSection
        title="Organisation not found"
        description="It may have been removed."
        action={
          <Button
            variant="secondary"
            render={<Link href="/dashboard/organisations" />}
          >
            All organisations
          </Button>
        }
      />
    )
  }

  return (
    <DashboardSection
      title={organisation.name}
      description={organisation.role}
      action={
        <Button
          variant="secondary"
          render={<Link href="/dashboard/organisations" />}
        >
          All organisations
        </Button>
      }
    >
      <div className="rounded-xl bg-card p-4 text-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Slug
        </p>
        <p className="mt-2 min-w-0 break-all font-mono text-xs">
          {organisation.slug}
        </p>
      </div>
    </DashboardSection>
  )
}
