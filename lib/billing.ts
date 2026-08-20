import type { BillingPlan } from "@/lib/api/types"

export type BillingPlanRef = {
  slug: string
  billingType: string
} | null

export type PlanAudience = "individual" | "organization"

export function isFreePlan(plan: BillingPlanRef): boolean {
  if (!plan) {
    return true
  }

  const slug = plan.slug.trim().toLowerCase()
  const billingType = plan.billingType.trim().toLowerCase()
  return slug === "free" || billingType === "free"
}

export function planSlug(plan: { slug: string } | string | null | undefined) {
  if (!plan) return "free"
  return (typeof plan === "string" ? plan : plan.slug).trim().toLowerCase()
}

export function isCurrentPlan(
  plan: Pick<BillingPlan, "slug" | "billingType">,
  currentSlug: string | null | undefined
) {
  const current = planSlug(currentSlug)
  if (isFreePlan(plan)) {
    return current === "free" || current === ""
  }
  return planSlug(plan) === current
}

export function isRecommendedPlan(plan: Pick<BillingPlan, "slug" | "billingType">) {
  return planSlug(plan) === "pro" && !isFreePlan(plan)
}

export function formatPlanMoney(cents: number, currency: string) {
  const code = currency.trim().toUpperCase() || "USD"
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)} ${code}`
  }
}

export function formatPlanPrice(plan: Pick<BillingPlan, "priceCents" | "seatPriceCents" | "currency">) {
  const perSeat = plan.seatPriceCents > 0
  const amount = formatPlanMoney(perSeat ? plan.seatPriceCents : plan.priceCents, plan.currency)
  return {
    amount,
    interval: perSeat ? "/ seat / month" : "/ month",
  }
}

export function formatCredits(value: number): string {
  const amount = Math.max(0, Number.isFinite(value) ? value : 0)

  if (amount < 1000) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)
  }

  const tiers = [
    [1_000_000_000, "b"],
    [1_000_000, "m"],
    [1_000, "k"],
  ] as const

  for (const [threshold, suffix] of tiers) {
    if (amount >= threshold) {
      const scaled = amount / threshold
      const decimals = scaled >= 100 ? 0 : 1
      const rounded = Math.round(scaled * 10 ** decimals) / 10 ** decimals
      const formatted = rounded
        .toFixed(decimals)
        .replace(/\.0$/, "")
      return `${formatted}${suffix}`
    }
  }

  return String(amount)
}

/** Exact credit count for billing surfaces (no k rounding). */
export function formatCreditsDetail(value: number): string {
  const amount = Math.max(0, Number.isFinite(value) ? value : 0)
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)
}

export function creditUsagePercent(used: number, granted: number): number {
  if (!Number.isFinite(used) || !Number.isFinite(granted) || granted <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, (used / granted) * 100))
}

export function billingPaymentUrl(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null
  }

  const record = data as Record<string, unknown>
  for (const key of ["paymentUrl", "url", "checkoutUrl", "checkout_url"]) {
    const value = record[key]
    if (typeof value === "string" && /^https?:\/\//i.test(value)) {
      return value
    }
  }

  return null
}
