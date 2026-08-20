import { Suspense } from "react"

import { AuthCallback } from "@/components/auth/auth-callback"
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"

export default function CallbackPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthCallback />
    </Suspense>
  )
}
