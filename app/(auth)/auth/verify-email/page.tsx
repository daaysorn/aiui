import { Suspense } from "react"

import { VerifyEmailView } from "@/views/auth/verifyEmailView"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailView />
    </Suspense>
  )
}
