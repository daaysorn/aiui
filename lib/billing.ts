export type BillingPlanRef = {
  slug: string
  billingType: string
} | null

export function isFreePlan(plan: BillingPlanRef): boolean {
  if (!plan) {
    return true
  }

  const slug = plan.slug.trim().toLowerCase()
  const billingType = plan.billingType.trim().toLowerCase()
  return slug === "free" || billingType === "free"
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
