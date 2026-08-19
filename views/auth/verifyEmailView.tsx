"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { AuthField, AuthMessage, AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export function VerifyEmailView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function sendCode() {
    setError(null)
    setMessage(null)
    const result = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    })
    if (result.error) {
      setError(result.error.message ?? "Could not send code")
      return
    }
    setMessage("Verification code sent.")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await authClient.emailOtp.verifyEmail({ email, otp })

    setPending(false)

    if (result.error) {
      setError(result.error.message ?? "Verification failed")
      return
    }

    router.push("/onboarding")
    router.refresh()
  }

  return (
    <AuthShell
      title="Verify email"
      description="Enter the six-digit code we sent to your inbox."
      footer={
        <p>
          Wrong address?{" "}
          <Link href="/auth/sign-up" className="text-primary underline-offset-4 hover:underline">
            Start over
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
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
        <AuthField label="Verification code" htmlFor="otp">
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
        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Verifying..." : "Verify email"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={sendCode}>
            Resend code
          </Button>
        </div>
      </form>
    </AuthShell>
  )
}
