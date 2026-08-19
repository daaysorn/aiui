"use client"

import { useMemo, useState, type ElementType } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  BuildingsIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CrownIcon,
  RocketLaunchIcon,
  UserIcon,
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

function planLabel(plan: BillingPlan) {
  if (isFreePlan(plan)) {
    return plan.name
  }
  return `Daaybot ${plan.name}`
}

function planIntervalLabel(interval: string) {
  return interval.replace(/^\/\s*/, "per ")
}

function planSummary(plan: BillingPlan) {
  if (plan.description?.trim()) {
    return plan.description.trim()
  }

  const parts: string[] = []
  if (plan.includedCredits > 0) {
    parts.push(
      `${new Intl.NumberFormat().format(plan.includedCredits)} credits/mo`
    )
  }
  if (plan.minSeats > 0) {
    parts.push(`${plan.minSeats} seat minimum`)
  }
  return parts.join(" · ") || "Monthly Daaybot access"
}

function planCta(plan: BillingPlan, current: boolean) {
  if (current) {
    return "Current plan"
  }
  if (isFreePlan(plan)) {
    return "Included"
  }
  return "Upgrade"
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
      <DialogContent className="max-h-[min(90dvh,40rem)] gap-5 overflow-y-auto p-5 sm:max-w-4xl">
        <DialogHeader className="items-center gap-1 pr-8 text-center">
          <DialogTitle className="font-heading text-lg font-semibold tracking-tight">
            Choose a plan
          </DialogTitle>
          <DialogDescription>Pick your monthly plan</DialogDescription>
        </DialogHeader>

        <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(
            [
              ["individual", "Personal"],
              ["organization", "Business"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                audience === value
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={audience === value}
              onClick={() => setAudience(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {isPending ? (
          <div className="grid grid-cols-2 gap-3 xs:grid-cols-3">
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-52 rounded-xl max-xs:col-span-2 max-xs:mx-auto max-xs:max-w-44" />
          </div>
        ) : isError ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Could not load plans.
          </p>
        ) : visible.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No plans in this tab.
          </p>
        ) : (
          <ul
            className={cn(
              "grid gap-3",
              visible.length === 1 && "mx-auto max-w-44 grid-cols-1",
              visible.length === 2 && "grid-cols-2",
              visible.length >= 3 && "grid-cols-2 xs:grid-cols-3"
            )}
          >
            {visible.map((plan) => {
              const current = isCurrentPlan(plan, currentSlug)
              const recommended = isRecommendedPlan(plan)
              const price = formatPlanPrice(plan)
              const busy = attaching === plan.slug
              const TierIcon = planIcon(plan)
              const hasFeatures = plan.features.length > 0

              return (
                <li key={plan.slug} className="min-w-0">
                  <article
                    className={cn(
                      "flex h-full min-w-0 flex-col rounded-xl p-4",
                      current && "bg-muted/50",
                      !current && recommended && "bg-card",
                      !current && !recommended && "bg-muted"
                    )}
                  >
                    <TierIcon
                      className={cn(
                        "size-5 shrink-0",
                        recommended ? "text-primary" : "text-muted-foreground"
                      )}
                      weight="duotone"
                      aria-hidden
                    />

                    <h3 className="mt-3 font-heading text-base font-semibold leading-tight tracking-tight">
                      {planLabel(plan)}
                    </h3>

                    <p className="mt-2 leading-none">
                      <span className="text-2xl font-semibold tracking-tight break-all">
                        {price.amount}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {planIntervalLabel(price.interval)}
                      </span>
                    </p>

                    <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-snug text-muted-foreground">
                      {planSummary(plan)}
                    </p>

                    <Button
                      className="mt-4 w-full"
                      size="sm"
                      variant={
                        current
                          ? "secondary"
                          : recommended
                            ? "default"
                            : "secondary"
                      }
                      disabled={
                        current || isFreePlan(plan) || Boolean(attaching)
                      }
                      loading={busy}
                      onClick={() => void handleSelect(plan)}
                    >
                      {planCta(plan, current)}
                    </Button>

                    {hasFeatures ? (
                      <details className="group mt-auto pt-3">
                        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                          <CaretDownIcon
                            className="size-3.5 shrink-0 transition-transform group-open:rotate-180"
                            aria-hidden
                          />
                          {plan.features.length} included
                        </summary>
                        <ul className="mt-2 space-y-1.5">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex min-w-0 items-start gap-2 text-xs leading-snug text-muted-foreground"
                            >
                              <CheckCircleIcon
                                className="mt-0.5 size-3 shrink-0 text-primary/80"
                                weight="fill"
                                aria-hidden
                              />
                              <span className="min-w-0">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
