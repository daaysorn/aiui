import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { isFreePlan } from "@/lib/billing"
import { getAccessToken, getUserOverview, needsOnboarding } from "@/lib/session"
import { siteRoutes } from "@/lib/site"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const token = await getAccessToken()
  if (!token) {
    redirect(siteRoutes.signIn)
  }

  const overview = await getUserOverview()
  if (!overview) {
    redirect(siteRoutes.signIn)
  }

  const { user, billing } = overview

  if (!user.emailVerified) {
    redirect(siteRoutes.verifyEmail)
  }

  if (needsOnboarding(user)) {
    redirect(siteRoutes.onboarding)
  }

  return (
    <DashboardShell
      userName={user.name}
      userImage={user.image}
      planName={billing.plan?.name ?? "Free"}
      creditBalance={billing.credits.balance}
      showUpgrade={isFreePlan(billing.plan)}
    >
      {children}
    </DashboardShell>
  )
}
