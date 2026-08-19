"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { AuthField, AuthMessage, AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export function ResetPasswordView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    })

    setPending(false)

    if (result.error) {
      setError(result.error.message ?? "Password reset failed")
      return
    }

    router.push("/auth/sign-in")
  }

  return (
    <AuthShell
      title="Choose new password"
      description="Enter the code from your email and a new password."
      footer={
        <p>
          Need a new code?{" "}
          <Link
            href="/auth/forgot-password"
            className="text-primary underline-offset-4 hover:underline"
          >
            Send again
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
        <AuthField label="Reset code" htmlFor="otp">
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
        </AuthField>
        <AuthField label="New password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </AuthField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  )
}
