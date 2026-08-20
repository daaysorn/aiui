import { AUTUMN_CREDITS_FEATURE_ID } from "@/lib/billing/features"

type AutumnCustomerLike = {
  balances?: Record<
    string,
    { granted: number; remaining: number; usage: number }
  >
}

export type AutumnCreditsUsage = {
  featureId: string
  granted: number
  remaining: number
  usage: number
}

export function autumnCreditsUsage(
  customer: AutumnCustomerLike | null | undefined,
  featureId = AUTUMN_CREDITS_FEATURE_ID
): AutumnCreditsUsage | null {
  if (!customer?.balances) {
    return null
  }

  const balance = customer.balances[featureId]
  if (!balance) {
    return null
  }

  return {
    featureId,
    granted: balance.granted,
    remaining: balance.remaining,
    usage: balance.usage,
  }
}
