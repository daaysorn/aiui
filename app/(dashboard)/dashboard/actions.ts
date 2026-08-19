"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import { billingPaymentUrl } from "@/lib/billing"

export type UpgradeState = {
  error?: string
  ok?: boolean
}

export async function attachBillingPlanAction(input: {
  planId: string
  organizationId?: string
  seats?: number
}): Promise<UpgradeState> {
  const planId = input.planId.trim()
  if (!planId) {
    return { error: "Pick a plan to continue." }
  }

  let paymentUrl: string | null = null

  try {
    const result = await serverApiRequest<unknown>("/v1/billing/attach", {
      method: "POST",
      json: {
        planId,
        ...(input.organizationId ? { organizationId: input.organizationId } : {}),
        ...(input.seats ? { seats: input.seats } : {}),
      },
    })
    paymentUrl = billingPaymentUrl(result)
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not start upgrade." }
  }

  if (paymentUrl) {
    redirect(paymentUrl)
  }

  revalidatePath("/dashboard")
  return { ok: true }
}
