import Link from "next/link"

import {
  DashboardSection,
  StatCard,
} from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import type { UserOverview } from "@/lib/api/types"

export function OverviewView({ overview }: { overview: UserOverview }) {
  const workspace = overview.workspaces[0]
  const planName = overview.billing.plan?.name ?? "Free"
  const credits = overview.billing.credits.balance

  return (
    <DashboardSection
      title={`Welcome, ${overview.user.name.split(" ")[0]}`}
      description="Your workspace, credits, and projects in one place."
      action={
        <Button render={<Link href="/dashboard/projects/new" />}>
          New project
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Credits" value={String(credits)} hint="Available to spend on builds" />
        <StatCard label="Plan" value={planName} hint={overview.billing.subscription?.status ?? "No subscription"} />
        <StatCard
          label="Workspace"
          value={workspace?.name ?? "Personal"}
          hint={workspace?.kind === "organization" ? "Organisation workspace" : "Personal workspace"}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-heading text-base font-semibold">Organisations</h2>
        {overview.organizations.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            You are on a personal workspace. Create an organisation when you need a team.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {overview.organizations.map((org) => (
              <li
                key={org.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium">{org.name}</span>
                <span className="text-xs text-muted-foreground">{org.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardSection>
  )
}
