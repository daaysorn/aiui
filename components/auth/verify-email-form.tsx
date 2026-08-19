"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { AuthBrand } from "@/components/auth/auth-brand"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authClient, persistSession } from "@/lib/api/client"
import { sendVerificationOtp, verifyEmailOtp } from "@/lib/api/auth"
import { getSafeNextPath, siteRoutes } from "@/lib/site"

import { TurnstileField } from "./turnstile-field"

const OTP_RESEND_COOLDOWN_MS = 60_000
const OTP_SLOT_CLASS =
  "size-auto min-w-0 flex-1 aspect-square rounded-lg border text-lg first:rounded-lg first:border-l last:rounded-lg"

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim() ?? ""
  const [otp, setOtp] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<"verify" | "resend" | null>(
    null
  )
  const [resendAvailableAt, setResendAvailableAt] = useState(
    () => Date.now() + OTP_RESEND_COOLDOWN_MS
  )
  const [now, setNow] = useState(() => Date.now())

  const next = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams]
  )

  const resendSecondsLeft = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000)
  )
  const isBusy = pendingAction !== null
  const canResend = Boolean(email) && resendSecondsLeft === 0 && !isBusy

  useEffect(() => {
    if (email) return
    router.replace(siteRoutes.signUp)
  }, [email, router])

  useEffect(() => {
    if (resendSecondsLeft <= 0) return

    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => window.clearInterval(timer)
  }, [resendSecondsLeft])

  async function handleResend() {
    if (!canResend) return

    if (!captchaToken) {
      toast.error("Complete the Turnstile check to continue.")
      return
    }

    setPendingAction("resend")

    try {
      const result = await sendVerificationOtp(email, captchaToken)
      if (!result.ok) {
        toast.error(result.envelope.message ?? "Could not send code.")
        setPendingAction(null)
        return
      }

      toast.success("Verification code sent.")
      setResendAvailableAt(Date.now() + OTP_RESEND_COOLDOWN_MS)
      setNow(Date.now())
      setPendingAction(null)
    } catch {
      toast.error("Could not send code. Try again.")
      setPendingAction(null)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isBusy || !email || otp.length !== 6) return

    setPendingAction("verify")

    try {
      const baResult = await authClient.emailOtp.verifyEmail({ email, otp })
      if (!baResult.error && baResult.data) {
        const data = baResult.data as { token?: string; refreshToken?: string }
        if (data.token) {
          await persistSession({
            token: data.token,
            refreshToken: data.refreshToken,
          })
          toast.success("Email verified.")
          router.push(next === siteRoutes.dashboard ? siteRoutes.onboarding : next)
          router.refresh()
          return
        }
      }

      const result = await verifyEmailOtp({ email, otp })
      const token = result.envelope.data?.token
      if (!result.ok || !token) {
        toast.error(result.envelope.message ?? "Verification failed.")
        setPendingAction(null)
        return
      }

      await persistSession({
        token,
        refreshToken: result.envelope.data?.refreshToken,
      })
      toast.success("Email verified.")
      router.push(siteRoutes.onboarding)
      router.refresh()
    } catch {
      toast.error("Verification failed. Try again.")
      setPendingAction(null)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <Link
          href={siteRoutes.signIn}
          className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <CaretLeftIcon className="size-4" />
          Back
        </Link>
        <AuthBrand />
      </header>

      <div className="flex min-w-0 flex-col gap-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight xs:text-3xl">
          Verify email
        </h1>
        <p className="min-w-0 text-sm text-muted-foreground">
          Enter the six-digit code sent to{" "}
          <span className="break-all text-primary">{email}</span>
        </p>
      </div>

      <form className="flex min-w-0 flex-col gap-4" onSubmit={handleSubmit}>
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={otp}
          onChange={setOtp}
          disabled={isBusy}
          autoFocus
          containerClassName="w-full gap-1"
          aria-label="Verification code"
        >
          <InputOTPGroup className="flex w-full min-w-0 gap-1">
            <InputOTPSlot index={0} className={OTP_SLOT_CLASS} />
            <InputOTPSlot index={1} className={OTP_SLOT_CLASS} />
            <InputOTPSlot index={2} className={OTP_SLOT_CLASS} />
            <InputOTPSlot index={3} className={OTP_SLOT_CLASS} />
            <InputOTPSlot index={4} className={OTP_SLOT_CLASS} />
            <InputOTPSlot index={5} className={OTP_SLOT_CLASS} />
          </InputOTPGroup>
        </InputOTP>

        <TurnstileField onChange={setCaptchaToken} />

        <Button
          type="submit"
          className="w-full"
          disabled={isBusy || otp.length !== 6}
        >
          {pendingAction === "verify" ? "Verifying..." : "Verify email"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {resendSecondsLeft > 0 ? (
            `Resend in ${resendSecondsLeft}s`
          ) : (
            <>
              Didn&apos;t get a code?{" "}
              <button
                type="button"
                className="text-foreground disabled:opacity-50"
                onClick={() => void handleResend()}
                disabled={!canResend}
              >
                {pendingAction === "resend" ? "Sending..." : "Resend code"}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

export { VerifyEmailForm }
