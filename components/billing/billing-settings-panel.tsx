"use client"

import { useEffect, useState } from "react"
import { useListEvents } from "autumn-js/react"
import { useCustomer } from "autumn-js/react"

import { PlansDialog } from "@/components/dashboard/plans-dialog"
import {
  SettingsCard,
  SettingsPanel,
  SettingsStat,
  SettingsStatGrid,
} from "@/components/dashboard/settings-ui"
import { Button } from "@/components/ui/button"
import { SettingsLoading } from "@/components/dashboard/settings-ui"
import { useUserOverview } from "@/hooks/use-dashboard-query"
import {
  creditUsagePercent,
  formatCredits,
  formatCreditsDetail,
  isFreePlan,
} from "@/lib/billing"
import { autumnCreditsUsage } from "@/lib/billing/autumn-usage"
import { AUTUMN_CREDITS_FEATURE_ID } from "@/lib/billing/features"
import {
  creditUsageEventAmount,
  creditUsageEventLabel,
  formatUsageEventTime,
} from "@/lib/billing/usage-labels"

function CreditUsageProgress({
  used,
  granted,
  remaining,
}: {
  used: number
  granted: number
  remaining: number
}) {
  const percent = creditUsagePercent(used, granted)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 text-sm">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Used
          </p>
          <p className="font-heading text-lg font-semibold tabular-nums">
            {formatCreditsDetail(used)}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Included
          </p>
          <p className="font-heading text-lg font-semibold tabular-nums">
            {formatCreditsDetail(granted)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-label={`${formatCreditsDetail(used)} of ${formatCreditsDetail(granted)} credits used`}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {formatCreditsDetail(remaining)}
          </span>{" "}
          credits left
          <span className="text-muted-foreground">
            {" "}
            ({formatCredits(remaining)} compact)
          </span>
        </p>
      </div>
    </div>
  )
}

function CreditUsageHistory({
  events,
  loading,
}: {
  events: Array<{
    id: string
    featureId: string
    value: number
    timestamp: number
    properties?: Record<string, unknown>
  }>
  loading: boolean
}) {
  if (loading) {
    return <SettingsLoading label="Loading usage history" />
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No credit usage recorded this period yet.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex items-start justify-between gap-3 rounded-xl bg-background/70 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{creditUsageEventLabel(event)}</p>
            <p className="text-xs text-muted-foreground">
              {formatUsageEventTime(event.timestamp)}
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
            {creditUsageEventAmount(event.value)}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function BillingSettingsPanel() {
  const { data: overview } = useUserOverview()
  const { data: customer, isLoading: customerLoading, refetch } = useCustomer()
  const {
    list: events,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useListEvents({
    featureId: AUTUMN_CREDITS_FEATURE_ID,
    limit: 20,
  })
  const [plansOpen, setPlansOpen] = useState(false)

  useEffect(() => {
    if (!overview) return
    void refetch()
    void refetchEvents()
  }, [overview, refetch, refetchEvents])

  if (!overview) return null

  const planName = overview.billing.plan?.name ?? "Free"
  const showUpgrade = isFreePlan(overview.billing.plan)
  const autumnUsage = autumnCreditsUsage(customer)
  const creditGranted = autumnUsage?.granted ?? overview.billing.credits.granted
  const creditUsed =
    autumnUsage?.usage ?? Math.max(0, creditGranted - overview.billing.credits.balance)
  const creditRemaining =
    autumnUsage != null
      ? Math.max(0, autumnUsage.remaining)
      : overview.billing.credits.balance
  const usageEvents = (events ?? []).filter((event) => event.value > 0)

  return (
    <SettingsPanel>
      <SettingsStatGrid>
        <SettingsStat label="Current plan" value={planName} />
        <SettingsStat
          label="Credits left"
          value={
            customerLoading && !autumnUsage
              ? "…"
              : formatCreditsDetail(creditRemaining)
          }
          hint={
            autumnUsage
              ? `${formatCredits(creditRemaining)} compact`
              : "Syncs when Autumn loads"
          }
        />
      </SettingsStatGrid>

      <SettingsCard
        title="Usage this period"
        description="Credits consumed against your plan allowance."
      >
        {customerLoading && !autumnUsage ? (
          <SettingsLoading label="Loading credit balance" />
        ) : (
          <CreditUsageProgress
            used={creditUsed}
            granted={creditGranted}
            remaining={creditRemaining}
          />
        )}
      </SettingsCard>

      <SettingsCard title="Recent usage" description="How credits were spent.">
        <CreditUsageHistory events={usageEvents} loading={eventsLoading} />
      </SettingsCard>

      {showUpgrade ? (
        <SettingsCard
          title="Upgrade your workspace"
          description="Unlock more credits and team features."
        >
          <Button className="self-start" onClick={() => setPlansOpen(true)}>
            View plans
          </Button>
          <PlansDialog open={plansOpen} onOpenChange={setPlansOpen} />
        </SettingsCard>
      ) : null}
    </SettingsPanel>
  )
}
