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

export async function upgradeToProAction(): Promise<UpgradeState> {
  let paymentUrl: string | null = null

  try {
    const result = await serverApiRequest<unknown>("/v1/billing/attach", {
      method: "POST",
      json: { planId: "pro" },
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
