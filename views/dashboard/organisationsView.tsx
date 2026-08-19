"use client"

import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { useUserOverview } from "@/hooks/use-dashboard-query"

export function OrganisationsView() {
  const { data: overview, isPending } = useUserOverview()
  const organisations = overview?.organizations ?? []

  if (isPending || !overview) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardSection
      title="Organisations"
      description="Your saved team workspaces."
      action={
        <Button render={<Link href="/dashboard/organisations/new" />}>
          New organisation
        </Button>
      }
    >
      {organisations.length === 0 ? (
        <div className="rounded-xl bg-muted p-8 text-center">
          <p className="text-sm text-muted-foreground">No organisations yet.</p>
          <Button
            className="mt-4"
            render={<Link href="/dashboard/organisations/new" />}
          >
            Create your first organisation
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {organisations.map((organisation) => (
            <li key={organisation.id}>
              <Link
                href={`/dashboard/organisations/${organisation.slug}`}
                className="block rounded-xl bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <p className="font-medium">{organisation.name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {organisation.role}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  )
}
