"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  BuildingsIcon,
  CheckIcon,
  ClockIcon,
  GlobeIcon,
  LightningIcon,
  SparkleIcon,
  UserIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { attachBillingPlanAction } from "@/app/(dashboard)/dashboard/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useBillingPlans, useUserOverview } from "@/hooks/use-dashboard-query"
import type { BillingPlan } from "@/lib/api/types"
import {
  formatPlanPrice,
  isCurrentPlan,
  isFreePlan,
  isRecommendedPlan,
  type PlanAudience,
} from "@/lib/billing"
import { queryKeys } from "@/lib/query/keys"
import { cn } from "@/lib/utils"

function featureIcon(text: string) {
  const value = text.toLowerCase()
  if (value.includes("organisation") || value.includes("organization")) {
    return BuildingsIcon
  }
  if (value.includes("team") || value.includes("member") || value.includes("seat")) {
    return UsersThreeIcon
  }
  if (value.includes("extra") || value.includes("early")) {
    return LightningIcon
  }
  if (value.includes("usage")) {
    return ClockIcon
  }
  if (value.includes("publish") || value.includes("preview")) {
    return GlobeIcon
  }
  if (value.includes("personal")) {
    return UserIcon
  }
  if (value.includes("everything") || value.includes("builder")) {
    return SparkleIcon
  }
  return CheckIcon
}

function planTitle(plan: BillingPlan) {
  if (isFreePlan(plan)) {
    return plan.name
  }
  return `Daaybot ${plan.name}`
}

function planCta(plan: BillingPlan, current: boolean) {
  if (current) {
    return "Your current plan"
  }
  if (isFreePlan(plan)) {
    return "Stay on Free"
  }
  return `Upgrade to ${plan.name}`
}

export function PlansDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: overview } = useUserOverview()
  const { data: plans, isPending, isError } = useBillingPlans()
  const [audience, setAudience] = useState<PlanAudience>("individual")
  const [attaching, setAttaching] = useState<string | null>(null)

  const currentSlug = overview?.billing.plan?.slug ?? "free"
  const organizationId =
    overview?.session.activeOrganizationId ?? overview?.organizations[0]?.id

  const visible = useMemo(() => {
    return (plans ?? []).filter((plan) => plan.audience === audience)
  }, [audience, plans])

  const hasBusinessPlans = (plans ?? []).some(
    (plan) => plan.audience === "organization"
  )

  async function handleSelect(plan: BillingPlan) {
    if (isCurrentPlan(plan, currentSlug) || isFreePlan(plan) || attaching) {
      return
    }

    if (plan.audience === "organization" && !organizationId) {
      toast.error("Create an organisation first.")
      return
    }

    setAttaching(plan.slug)
    try {
      const result = await attachBillingPlanAction({
        planId: plan.slug,
        organizationId:
          plan.audience === "organization" ? organizationId : undefined,
        seats: plan.minSeats > 0 ? plan.minSeats : undefined,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.ok) {
        toast.success(`You're on ${plan.name}.`)
        onOpenChange(false)
        await queryClient.invalidateQueries({ queryKey: queryKeys.overview })
        router.refresh()
      }
    } finally {
      setAttaching(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,52rem)] overflow-y-auto bg-background p-5 sm:max-w-5xl sm:p-8">
        <DialogHeader className="items-center pr-8 text-center">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight xs:text-2xl">
            See what&apos;s new with Daaybot
          </DialogTitle>
          <DialogDescription>Pick a monthly plan</DialogDescription>
        </DialogHeader>

        <div className="mx-auto flex w-fit rounded-full bg-muted p-1">
          <button
            type="button"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              audience === "individual"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={audience === "individual"}
            onClick={() => setAudience("individual")}
          >
            Personal
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              audience === "organization"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={audience === "organization"}
            onClick={() => setAudience("organization")}
          >
            Business
          </button>
        </div>

        {isPending ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Could not load plans.
          </p>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No plans in this tab.
          </p>
        ) : (
          <div
            className={cn(
              "grid gap-3",
              visible.length === 1 && "mx-auto w-full max-w-sm grid-cols-1",
              visible.length === 2 && "sm:grid-cols-2",
              visible.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {visible.map((plan) => {
              const current = isCurrentPlan(plan, currentSlug)
              const recommended = isRecommendedPlan(plan)
              const price = formatPlanPrice(plan)
              const busy = attaching === plan.slug

              return (
                <article
                  key={plan.slug}
                  className={cn(
                    "relative flex min-w-0 flex-col gap-4 rounded-xl bg-muted p-5",
                    recommended && "bg-card ring-1 ring-primary"
                  )}
                >
                  {recommended ? (
                    <span className="absolute top-3 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary-foreground uppercase">
                      Recommended
                    </span>
                  ) : null}

                  <div className="flex min-w-0 flex-col gap-1 pr-16">
                    <p className="text-xs font-medium text-muted-foreground">
                      {plan.name}
                    </p>
                    <h3 className="font-heading text-lg font-semibold tracking-tight">
                      {planTitle(plan)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description ?? "Monthly Daaybot access"}
                    </p>
                  </div>

                  <p className="min-w-0 text-2xl font-semibold tracking-tight break-all">
                    {price.amount}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {price.interval}
                    </span>
                  </p>

                  <Button
                    className="w-full"
                    variant={recommended ? "default" : "secondary"}
                    disabled={current || isFreePlan(plan) || Boolean(attaching)}
                    loading={busy}
                    onClick={() => void handleSelect(plan)}
                  >
                    {planCta(plan, current)}
                  </Button>

                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((feature) => {
                      const Icon = featureIcon(feature)
                      return (
                        <li
                          key={feature}
                          className="flex min-w-0 items-start gap-2 text-sm"
                        >
                          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0">{feature}</span>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            })}
          </div>
        )}

        {audience === "individual" && hasBusinessPlans ? (
          <button
            type="button"
            className="mx-auto text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setAudience("organization")}
          >
            Need more for business?
          </button>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
