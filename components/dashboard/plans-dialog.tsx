"use client"

import { useMemo, useState, type ElementType } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  CrownIcon,
  GlobeIcon,
  LightningIcon,
  RocketLaunchIcon,
  SparkleIcon,
  UserIcon,
  UsersThreeIcon,
  type IconProps,
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
  planSlug,
  type PlanAudience,
} from "@/lib/billing"
import { queryKeys } from "@/lib/query/keys"
import { cn } from "@/lib/utils"

type PhosphorIcon = ElementType<IconProps>

function featureIcon(text: string): PhosphorIcon {
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
  return CheckCircleIcon
}

function planIcon(plan: BillingPlan): PhosphorIcon {
  if (isFreePlan(plan)) {
    return UserIcon
  }
  if (planSlug(plan) === "pro") {
    return CrownIcon
  }
  if (plan.audience === "organization") {
    return BuildingsIcon
  }
  return RocketLaunchIcon
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
      <DialogContent className="max-h-[min(90dvh,44rem)] overflow-y-auto bg-background p-4 sm:max-w-4xl sm:p-6">
        <DialogHeader className="items-center gap-1 pr-8 text-center">
          <DialogTitle className="font-heading text-lg font-semibold tracking-tight xs:text-xl">
            See what&apos;s new with Daaybot
          </DialogTitle>
          <DialogDescription>Pick a monthly plan</DialogDescription>
        </DialogHeader>

        <div className="mx-auto flex w-fit rounded-full bg-muted p-0.5">
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
              audience === "individual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={audience === "individual"}
            onClick={() => setAudience("individual")}
          >
            <UserIcon className="size-3.5" weight="duotone" aria-hidden />
            Personal
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
              audience === "organization"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={audience === "organization"}
            onClick={() => setAudience("organization")}
          >
            <BuildingsIcon className="size-3.5" weight="duotone" aria-hidden />
            Business
          </button>
        </div>

        {isPending ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="hidden h-56 rounded-xl lg:block" />
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Could not load plans.
          </p>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No plans in this tab.
          </p>
        ) : (
          <div
            className={cn(
              "grid gap-2.5",
              visible.length === 1 && "mx-auto w-full max-w-xs grid-cols-1",
              visible.length === 2 && "sm:grid-cols-2",
              visible.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {visible.map((plan) => {
              const current = isCurrentPlan(plan, currentSlug)
              const recommended = isRecommendedPlan(plan)
              const price = formatPlanPrice(plan)
              const busy = attaching === plan.slug
              const TierIcon = planIcon(plan)

              return (
                <article
                  key={plan.slug}
                  className={cn(
                    "relative flex min-w-0 flex-col gap-3 rounded-xl bg-muted p-4",
                    recommended && "bg-card ring-1 ring-primary/60"
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-background",
                        recommended && "text-primary"
                      )}
                    >
                      <TierIcon className="size-5" weight="duotone" aria-hidden />
                    </div>

                    <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                        <h3 className="font-heading text-base font-semibold leading-tight tracking-tight">
                          {planTitle(plan)}
                        </h3>
                        {recommended ? (
                          <span className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium tracking-wide text-primary uppercase">
                            Recommended
                          </span>
                        ) : null}
                        {current ? (
                          <span className="rounded-full bg-background px-1.5 py-px text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                            Current
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                        {plan.description ?? "Monthly Daaybot access"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 shrink-0 text-xl font-semibold tracking-tight break-all">
                      {price.amount}
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        {price.interval}
                      </span>
                    </p>
                    <Button
                      className="ml-auto min-w-0 flex-1"
                      size="sm"
                      variant={recommended ? "default" : "secondary"}
                      disabled={current || isFreePlan(plan) || Boolean(attaching)}
                      loading={busy}
                      onClick={() => void handleSelect(plan)}
                    >
                      {planCta(plan, current)}
                    </Button>
                  </div>

                  <ul className="flex flex-col gap-1.5">
                    {plan.features.map((feature) => {
                      const Icon = featureIcon(feature)
                      return (
                        <li
                          key={feature}
                          className="flex min-w-0 items-start gap-2 text-xs leading-snug"
                        >
                          <Icon
                            className={cn(
                              "mt-px size-3.5 shrink-0",
                              recommended ? "text-primary" : "text-muted-foreground"
                            )}
                            weight={Icon === CheckCircleIcon ? "fill" : "duotone"}
                            aria-hidden
                          />
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
            className="mx-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setAudience("organization")}
          >
            <BuildingsIcon className="size-3.5" weight="duotone" aria-hidden />
            Need more for business?
          </button>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
