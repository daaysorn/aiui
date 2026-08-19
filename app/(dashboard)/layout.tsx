import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getServerSession, needsOnboarding } from "@/lib/session"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  if (!session.user.emailVerified) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`)
  }

  if (needsOnboarding(session.user)) {
    redirect("/onboarding")
  }

  return (
    <DashboardShell userName={session.user.name} userEmail={session.user.email}>
      {children}
    </DashboardShell>
  )
}
