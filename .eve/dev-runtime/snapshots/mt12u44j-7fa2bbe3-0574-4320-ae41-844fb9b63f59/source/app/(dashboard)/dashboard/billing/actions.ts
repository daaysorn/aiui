"use server"

import { revalidatePath } from "next/cache"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import type { FeatureAccessResult } from "@/lib/billing/features"

export type BillingUsageState = {
  error?: string
  ok?: boolean
}

export async function checkFeatureAccessAction(input: {
  featureId: string
  requiredBalance?: number
}): Promise<FeatureAccessResult & BillingUsageState> {
  const featureId = input.featureId.trim()
  if (!featureId) {
    return { allowed: false, error: "Feature required." }
  }

  try {
    const result = await serverApiRequest<FeatureAccessResult>("/v1/billing/check", {
      method: "POST",
      json: {
        featureId,
        ...(input.requiredBalance !== undefined
          ? { requiredBalance: input.requiredBalance }
          : {}),
      },
    })

    return { allowed: Boolean(result.allowed), ok: true }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { allowed: false, error: error.message }
    }

    return { allowed: false, error: "Could not verify access." }
  }
}

export async function trackFeatureUsageAction(input: {
  featureId: string
  value?: number
}): Promise<BillingUsageState> {
  const featureId = input.featureId.trim()
  if (!featureId) {
    return { error: "Feature required." }
  }

  try {
    await serverApiRequest("/v1/billing/track", {
      method: "POST",
      json: {
        featureId,
        value: input.value ?? 1,
      },
    })

    revalidatePath("/dashboard")
    return { ok: true }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not record usage." }
  }
}

export type BillingPortalState = {
  url?: string
  error?: string
}

export async function openBillingPortalAction(
  returnUrl?: string
): Promise<BillingPortalState> {
  try {
    const result = await serverApiRequest<{ url: string }>("/v1/billing/portal", {
      method: "POST",
      json: {
        returnUrl:
          returnUrl?.trim() ||
          `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/dashboard?settings=billing`,
      },
    })

    if (typeof result.url !== "string" || !/^https?:\/\//i.test(result.url)) {
      return { error: "Billing portal link missing." }
    }

    return { url: result.url }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not open billing portal." }
  }
}
