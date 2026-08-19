"use server"

import { redirect } from "next/navigation"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import { siteRoutes } from "@/lib/site"

export type OnboardingState = {
  error?: string
}

export async function submitOnboarding(
  _previous: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState> {
  const username = String(formData.get("username") ?? "").trim()
  const telephone = String(formData.get("telephone") ?? "").trim()

  try {
    await serverApiRequest<{ status: boolean }>("/v1/user/onboarding", {
      method: "PATCH",
      json: { username, telephone },
    })
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not save profile." }
  }

  redirect(siteRoutes.dashboard)
}
