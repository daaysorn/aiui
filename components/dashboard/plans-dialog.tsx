"use client"

import { useMemo, useState, type ElementType } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  BuildingsIcon,
  CheckCircleIcon,
  CrownIcon,
  RocketLaunchIcon,
  SparkleIcon,
  UserIcon,
  type IconProps,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { attachBillingPlanAction } from "@/app/(dashboard)/dashboard/actions"
import { Badge } from "@/components/ui/badge"
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
  formatCredits,
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

const audienceOptions = [
  ["individual", "Personal"],
  ["organization", "Business"],
] as const satisfies ReadonlyArray<readonly [PlanAudience, string]>

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

function planTagline(plan: BillingPlan) {
  if (plan.description?.trim()) {
    return plan.description.trim()
  }

  const parts: string[] = []
  if (plan.includedCredits > 0) {
    parts.push(
      `${formatCredits(plan.includedCredits)} credits each month`
    )
  }
  if (plan.minSeats > 0) {
    parts.push(`${plan.minSeats} seat minimum`)
  }
  return parts.join(". ") || "Monthly Daaybot access"
}

function planCta(plan: BillingPlan, current: boolean, recommended: boolean) {
  if (current) {
    return "Your current plan"
  }
  if (isFreePlan(plan)) {
    return "Included"
  }
  if (recommended) {
    return `Get ${plan.name}`
  }
  return "Upgrade"
}

function PlanAudienceToggle({
  audience,
  onAudienceChange,
}: {
  audience: PlanAudience
  onAudienceChange: (audience: PlanAudience) => void
}) {
  return (
    <div
      className="mx-auto grid w-full max-w-xs grid-cols-2 gap-1 rounded-full bg-muted p-1"
      role="tablist"
      aria-label="Plan audience"
    >
      {audienceOptions.map(([value, label]) => {
        const selected = audience === value
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onAudienceChange(value)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function PlanCard({
  plan,
  currentSlug,
  attaching,
  onSelect,
}: {
  plan: BillingPlan
  currentSlug: string
  attaching: string | null
  onSelect: (plan: BillingPlan) => void
}) {
  const current = isCurrentPlan(plan, currentSlug)
  const recommended = isRecommendedPlan(plan)
  const price = formatPlanPrice(plan)
  const busy = attaching === plan.slug
  const TierIcon = planIcon(plan)
  const features = plan.features.slice(0, 8)

  return (
    <li className="min-w-0">
      <article
        className={cn(
          "relative flex h-full min-w-0 flex-col rounded-2xl p-5 sm:p-6",
          recommended && !current && "bg-primary/8",
          current && "bg-muted/45",
          !current && !recommended && "bg-muted/60"
        )}
      >
        {recommended && !current ? (
          <Badge className="absolute top-4 right-4 gap-1">
            <SparkleIcon weight="fill" aria-hidden />
            Popular
          </Badge>
        ) : null}

        <div className="flex items-start gap-3 pr-16">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              recommended ? "bg-primary/10 text-primary" : "bg-background/70 text-muted-foreground"
            )}
          >
            <TierIcon className="size-5" weight={recommended ? "fill" : "duotone"} aria-hidden />
          </span>
          <div className="min-w-0 flex flex-col gap-1">
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {plan.name}
            </h3>
            <p className="text-sm text-muted-foreground">{planTagline(plan)}</p>
          </div>
        </div>

        <p className="mt-5 leading-none">
          <span className="font-heading text-3xl font-semibold tracking-tight break-all">
            {price.amount}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {price.interval.replace(/^\/\s*/, "")}
          </span>
        </p>

        {features.length > 0 ? (
          <ul className="mt-5 flex flex-1 flex-col gap-2.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex min-w-0 items-start gap-2.5 text-sm leading-snug text-muted-foreground"
              >
                <CheckCircleIcon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  weight="fill"
                  aria-hidden
                />
                <span className="min-w-0">{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-1" />
        )}

        <Button
          className="mt-6 w-full"
          variant={
            current ? "secondary" : recommended ? "default" : "secondary"
          }
          disabled={current || isFreePlan(plan) || Boolean(attaching)}
          loading={busy}
          onClick={() => void onSelect(plan)}
        >
          {planCta(plan, current, recommended)}
        </Button>
      </article>
    </li>
  )
}

function PlansSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-[28rem] rounded-2xl" />
      <Skeleton className="h-[28rem] rounded-2xl" />
      <Skeleton className="h-[28rem] rounded-2xl max-md:col-span-full" />
    </div>
  )
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
    return [...(plans ?? [])]
      .filter((plan) => plan.audience === audience)
      .sort((a, b) => a.sortOrder - b.sortOrder)
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
        returnUrl: `${window.location.origin}/dashboard?settings=billing`,
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
      <DialogContent
        overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-md"
        className="max-h-[min(92dvh,44rem)] gap-0 overflow-hidden rounded-3xl bg-background p-0 shadow-lg sm:max-w-5xl"
      >
        <div className="flex max-h-[min(92dvh,44rem)] flex-col overflow-y-auto p-5 sm:p-8">
          <DialogHeader className="items-center gap-2 pb-6 text-center">
            <DialogTitle className="font-heading text-2xl font-semibold tracking-tight">
              Upgrade your plan
            </DialogTitle>
            <DialogDescription>Compare plans and credits</DialogDescription>
          </DialogHeader>

          <PlanAudienceToggle audience={audience} onAudienceChange={setAudience} />

          <div className="mt-6">
            {isPending ? (
              <PlansSkeleton />
            ) : isError ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Could not load plans.
              </p>
            ) : visible.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No plans in this tab.
              </p>
            ) : (
              <ul
                className={cn(
                  "grid gap-4",
                  visible.length === 1 && "mx-auto max-w-sm grid-cols-1",
                  visible.length === 2 && "grid-cols-1 xs:grid-cols-2",
                  visible.length >= 3 && "grid-cols-1 xs:grid-cols-2 md:grid-cols-3"
                )}
              >
                {visible.map((plan) => (
                  <PlanCard
                    key={plan.slug}
                    plan={plan}
                    currentSlug={currentSlug}
                    attaching={attaching}
                    onSelect={handleSelect}
                  />
                ))}
              </ul>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Plans renew monthly. Credits reset each billing period.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
