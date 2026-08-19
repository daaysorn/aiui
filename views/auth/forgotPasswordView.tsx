"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthField, AuthMessage, AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export function ForgotPasswordView() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await authClient.emailOtp.requestPasswordReset({ email })

    setPending(false)

    if (result.error) {
      setError(result.error.message ?? "Could not send reset code")
      return
    }

    router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
  }

  return (
    <AuthShell
      title="Reset password"
      description="We will email a one-time code so you can choose a new password."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/auth/sign-in" className="text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        <AuthField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </AuthField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending code..." : "Send reset code"}
        </Button>
      </form>
    </AuthShell>
  )
}
