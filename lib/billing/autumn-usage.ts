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

type WorkspaceCredits = {
  balance: number
  granted: number
}

function asCredit(value: number): number {
  return Math.max(0, Number.isFinite(value) ? value : 0)
}

/**
 * Autumn tracks the paid plan pool. Signup / leftover workspace grants sit
 * on the workspace ledger and must be added or the UI under-counts (2k instead
 * of 2.1k when 100 grant credits are unused).
 */
export function combineWorkspaceAndAutumnCredits(
  workspace: WorkspaceCredits | null | undefined,
  autumn: AutumnCreditsUsage | null
): AutumnCreditsUsage | null {
  const wsBalance = asCredit(workspace?.balance ?? 0)
  const wsGranted = asCredit(workspace?.granted ?? 0)

  if (!autumn) {
    if (!workspace) {
      return null
    }

    const granted = Math.max(wsGranted, wsBalance)
    return {
      featureId: AUTUMN_CREDITS_FEATURE_ID,
      granted,
      remaining: wsBalance,
      usage: Math.max(0, granted - wsBalance),
    }
  }

  const leftoverBeyondPlan = Math.max(0, wsBalance - autumn.granted)
  const extraRemaining =
    leftoverBeyondPlan > 0
      ? leftoverBeyondPlan
      : wsBalance <= wsGranted
        ? wsBalance
        : 0

  return {
    featureId: autumn.featureId,
    granted: autumn.granted + extraRemaining,
    remaining: autumn.remaining + extraRemaining,
    usage: autumn.usage,
  }
}
