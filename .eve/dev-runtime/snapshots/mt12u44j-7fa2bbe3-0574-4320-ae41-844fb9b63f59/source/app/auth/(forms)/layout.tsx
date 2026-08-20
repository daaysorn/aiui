import type { ReactNode } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { AuthTermsFooter } from "@/components/auth/auth-terms-footer"

export default function AuthFormsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthShell className="pb-28">{children}</AuthShell>
      <AuthTermsFooter />
    </>
  )
}
