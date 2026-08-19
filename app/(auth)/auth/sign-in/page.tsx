import { Suspense } from "react"

import { SignInView } from "@/views/auth/signInView"

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInView />
    </Suspense>
  )
}
