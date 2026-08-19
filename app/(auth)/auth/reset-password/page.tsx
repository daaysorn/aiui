import { Suspense } from "react"

import { ResetPasswordView } from "@/views/auth/resetPasswordView"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  )
}
