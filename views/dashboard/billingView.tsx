"use client"

import { useState } from "react"

import { PlansDialog } from "@/components/dashboard/plans-dialog"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { useUserOverview } from "@/hooks/use-dashboard-query"
import { isFreePlan } from "@/lib/billing"

function formatCreditBalance(balance: number) {
  return new Intl.NumberFormat("en-US").format(balance)
}

export function BillingView() {
  const { data: overview, isPending } = useUserOverview()
  const [plansOpen, setPlansOpen] = useState(false)

  if (isPending || !overview) {
    return <DashboardSkeleton />
  }

  const planName = overview.billing.plan?.name ?? "Free"
  const creditBalance = overview.billing.credits.balance
  const showUpgrade = isFreePlan(overview.billing.plan)

  return (
    <DashboardSection title="Billing" description="Plan and credit balance.">
      <div className="grid max-w-xl gap-3">
        <div className="rounded-xl bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Plan
          </p>
          <p className="mt-2 font-heading text-2xl font-semibold">{planName}</p>
        </div>
        <div className="rounded-xl bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Credits
          </p>
          <p className="mt-2 font-heading text-2xl font-semibold">
            {formatCreditBalance(creditBalance)}
          </p>
        </div>
        {showUpgrade ? (
          <Button onClick={() => setPlansOpen(true)}>Upgrade</Button>
        ) : null}
      </div>
      {showUpgrade ? (
        <PlansDialog open={plansOpen} onOpenChange={setPlansOpen} />
      ) : null}
    </DashboardSection>
  )
}
