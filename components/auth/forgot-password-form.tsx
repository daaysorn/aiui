"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { AuthBrand } from "@/components/auth/auth-brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requestPasswordReset, resetPasswordWithToken } from "@/lib/api/auth"
import {
  getPasswordResetResendAvailableAt,
  setPasswordResetResendCooldown,
} from "@/lib/auth/otp-resend-cooldown"
import { authCopy, siteRoutes } from "@/lib/site"

import { PasswordInput } from "./password-input"
import { TurnstileField } from "./turnstile-field"

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get("email")?.trim() ?? "")
  const [password, setPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [linkSent, setLinkSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const [resendAvailableAt, setResendAvailableAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const resendSecondsLeft = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000)
  )

  const resetToken = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams]
  )

  useEffect(() => {
    const error = searchParams.get("error")?.trim()
    if (error === "INVALID_TOKEN") {
      toast.error("Reset link expired. Request a new one.")
    }
  }, [searchParams])

  useEffect(() => {
    if (!email.trim()) return

    const stored = getPasswordResetResendAvailableAt(email)
    if (stored === null) return

    setResendAvailableAt(stored)
    setNow(Date.now())
    if (!resetToken) setLinkSent(true)
  }, [email, resetToken])

  useEffect(() => {
    if (resendSecondsLeft <= 0) return

    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => window.clearInterval(timer)
  }, [resendSecondsLeft])

  async function handleRequestLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || (linkSent && resendSecondsLeft > 0)) return
    if (!captchaToken) {
      toast.error("Complete the Turnstile check to continue.")
      return
    }
    setPending(true)

    const redirectTo = `${window.location.origin}${siteRoutes.forgotPassword}`
    const result = await requestPasswordReset(
      email.trim(),
      redirectTo,
      captchaToken
    )
    setPending(false)
    setCaptchaToken(null)
    setTurnstileResetKey((key) => key + 1)

    if (!result.ok) {
      toast.error(result.envelope.message || "Could not send reset link.")
      return
    }

    toast.success("Reset link sent.")
    setResendAvailableAt(setPasswordResetResendCooldown(email.trim()))
    setNow(Date.now())
    setLinkSent(true)
  }

  async function handleTokenReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || !resetToken) return
    setPending(true)

    const result = await resetPasswordWithToken({
      token: resetToken,
      newPassword: password,
    })

    setPending(false)

    if (!result.ok) {
      toast.error(result.envelope.message || "Password reset failed.")
      return
    }

    toast.success("Password updated.")
    router.push(siteRoutes.signIn)
  }

  const subtitle = resetToken
    ? "Choose a new password."
    : linkSent
      ? "Check email for reset link."
      : "We email a reset link."

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <AuthBrand />
        <Button variant="outline" size="sm" render={<Link href={siteRoutes.signIn} />}>
          Sign in
        </Button>
      </header>

      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {resetToken ? (
        <form className="space-y-4" onSubmit={handleTokenReset}>
          <PasswordInput
            showStrength
            placeholder={authCopy.placeholders.resetPassword}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" className="w-full" loading={pending}>
            Update password
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleRequestLink}>
          {linkSent ? (
            <p className="text-sm text-muted-foreground">
              If an account exists for{" "}
              <span className="break-all font-medium text-foreground">{email}</span>,
              open the link in that email to choose a new password.
            </p>
          ) : (
            <Input
              type="email"
              placeholder={authCopy.placeholders.email}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          )}
          <TurnstileField
            resetKey={turnstileResetKey}
            onChange={setCaptchaToken}
          />
          <Button
            type="submit"
            variant={linkSent ? "outline" : "default"}
            className="w-full"
            loading={pending}
            disabled={linkSent && resendSecondsLeft > 0}
          >
            {linkSent
              ? resendSecondsLeft > 0
                ? `Send another in ${resendSecondsLeft}s`
                : "Send another link"
              : "Email reset link"}
          </Button>
        </form>
      )}
    </div>
  )
}

export { ForgotPasswordForm }
