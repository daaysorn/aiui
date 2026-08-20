"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import {
  AIUI_ONBOARDING_SKIPPED_COOKIE,
  aiuiCookieOptions,
} from "@/lib/api/cookies"
import { getServerUser } from "@/lib/session"
import { siteRoutes } from "@/lib/site"

export type OnboardingState = {
  error?: string
}

export async function submitOnboarding(
  _previous: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState> {
  const skip = formData.get("skip") === "1"
  const cookieStore = await cookies()

  if (skip) {
    const user = await getServerUser()
    if (!user) {
      redirect(siteRoutes.signIn)
    }

    cookieStore.set(AIUI_ONBOARDING_SKIPPED_COOKIE, user.id, {
      ...aiuiCookieOptions(),
      maxAge: 60 * 60 * 24 * 365,
    })
    redirect(siteRoutes.dashboard)
  }

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

  cookieStore.delete(AIUI_ONBOARDING_SKIPPED_COOKIE)
  redirect(siteRoutes.dashboard)
}
