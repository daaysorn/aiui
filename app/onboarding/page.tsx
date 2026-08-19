import { redirect } from "next/navigation"

import { OnboardingForm } from "@/components/auth/onboarding-form"
import { getServerUser, needsOnboarding } from "@/lib/session"
import { siteRoutes } from "@/lib/site"

export default async function OnboardingPage() {
  const user = await getServerUser()

  if (!user) {
    redirect(siteRoutes.signIn)
  }

  if (!user.emailVerified) {
    redirect(`${siteRoutes.signUp}?step=verify&email=${encodeURIComponent(user.email)}`)
  }

  if (!needsOnboarding(user)) {
    redirect(siteRoutes.dashboard)
  }

  return <OnboardingForm />
}
