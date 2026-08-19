import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { DashboardQueryProvider } from "@/components/dashboard/query-provider"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { isFreePlan } from "@/lib/billing"
import { getAccessToken, getUserOverview, shouldRedirectToOnboarding } from "@/lib/session"
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

  if (await shouldRedirectToOnboarding(user)) {
    redirect(siteRoutes.onboarding)
  }

  return (
    <DashboardQueryProvider overview={overview}>
      <DashboardShell
        userName={user.name}
        userHandle={user.username ?? user.displayUsername ?? user.name}
        userImage={user.image}
        planName={billing.plan?.name ?? "Free"}
        showUpgrade={isFreePlan(billing.plan)}
      >
        {children}
      </DashboardShell>
    </DashboardQueryProvider>
  )
}
