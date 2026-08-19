import { redirect } from "next/navigation"

import { OnboardingView } from "@/views/onboardingView"
import { getServerSession, needsOnboarding } from "@/lib/session"

export default async function OnboardingPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  if (!session.user.emailVerified) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`)
  }

  if (!needsOnboarding(session.user)) {
    redirect("/dashboard")
  }

  return <OnboardingView />
}
