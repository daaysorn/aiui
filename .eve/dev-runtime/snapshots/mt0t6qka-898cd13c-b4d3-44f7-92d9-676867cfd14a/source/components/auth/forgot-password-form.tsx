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
import {
  clearPendingResetEmail,
  getPendingResetEmail,
  setPendingResetEmail,
} from "@/lib/auth/pending-reset-email"
import { authCopy, siteRoutes } from "@/lib/site"

import { PasswordInput } from "./password-input"
import { TurnstileField } from "./turnstile-field"

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})
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
    const fromQuery = searchParams.get("email")?.trim()
    if (fromQuery) {
      setPendingResetEmail(fromQuery)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("email")
      const query = params.toString()
      router.replace(
        query ? `${siteRoutes.forgotPassword}?${query}` : siteRoutes.forgotPassword
      )
    }

    const stored = getPendingResetEmail() || fromQuery || ""
    if (stored) setEmail(stored)
  }, [router, searchParams])

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
    setPendingResetEmail(email.trim())
    setResendAvailableAt(setPasswordResetResendCooldown(email.trim()))
    setNow(Date.now())
    setLinkSent(true)
  }

  async function handleTokenReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || !resetToken) return

    const nextErrors: { password?: string; confirmPassword?: string } = {}
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters."
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password."
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match."
    }
    if (nextErrors.password || nextErrors.confirmPassword) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
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
    clearPendingResetEmail()
    router.push(siteRoutes.signIn)
  }

  const subtitle = resetToken
    ? "Choose a new password."
    : linkSent
      ? "Check email for reset link."
      : "We email a reset link."
  const canUpdatePassword =
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password === confirmPassword
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

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
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <PasswordInput
              id="password"
              showStrength
              autoComplete="new-password"
              placeholder={authCopy.placeholders.resetPassword}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((current) => ({
                    ...current,
                    password: undefined,
                  }))
                }
              }}
              required
              minLength={8}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder={authCopy.placeholders.confirmPassword}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((current) => ({
                    ...current,
                    confirmPassword: undefined,
                  }))
                }
              }}
              required
              minLength={8}
              aria-invalid={
                passwordsMismatch || Boolean(fieldErrors.confirmPassword)
              }
            />
            {passwordsMismatch || fieldErrors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {fieldErrors.confirmPassword ?? "Passwords do not match."}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            className="w-full"
            loading={pending}
            disabled={!canUpdatePassword}
          >
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
