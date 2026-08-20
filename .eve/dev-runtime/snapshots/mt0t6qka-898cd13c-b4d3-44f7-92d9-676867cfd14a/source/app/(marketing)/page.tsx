import { redirect } from "next/navigation"

import {
  getAccessToken,
  getServerUser,
  shouldRedirectToOnboarding,
} from "@/lib/session"
import { siteRoutes } from "@/lib/site"

export default async function HomePage() {
  const token = await getAccessToken()
  if (!token) {
    redirect(siteRoutes.signIn)
  }

  const user = await getServerUser()
  if (!user) {
    redirect(siteRoutes.signIn)
  }

  if (!user.emailVerified) {
    redirect(siteRoutes.verifyEmail)
  }

  if (await shouldRedirectToOnboarding(user)) {
    redirect(siteRoutes.onboarding)
  }

  redirect(siteRoutes.dashboard)
}
