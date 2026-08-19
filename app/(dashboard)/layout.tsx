import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getAccessToken, getServerUser, needsOnboarding } from "@/lib/session"
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

  const user = await getServerUser()
  if (!user) {
    redirect(siteRoutes.signIn)
  }

  if (!user.emailVerified) {
    redirect(siteRoutes.verifyEmail)
  }

  if (needsOnboarding(user)) {
    redirect(siteRoutes.onboarding)
  }

  return (
    <DashboardShell userName={user.name} userEmail={user.email}>
      {children}
    </DashboardShell>
  )
}
