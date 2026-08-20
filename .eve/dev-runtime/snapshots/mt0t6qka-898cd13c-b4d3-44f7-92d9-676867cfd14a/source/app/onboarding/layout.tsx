import type { ReactNode } from "react"

import { OnboardingHeader } from "@/components/auth/onboarding-header"
import { AuthShell } from "@/components/auth/auth-shell"
import { AuthTermsFooter } from "@/components/auth/auth-terms-footer"

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OnboardingHeader />
      <AuthShell className="pt-14 pb-28">{children}</AuthShell>
      <AuthTermsFooter />
    </>
  )
}
