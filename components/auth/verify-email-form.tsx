"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { CaretLeftIcon, SquaresFourIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authClient, persistSession } from "@/lib/api/client"
import { sendVerificationOtp, verifyEmailOtp } from "@/lib/api/auth"
import { getSafeNextPath, siteRoutes } from "@/lib/site"

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") ?? ""
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [pending, setPending] = useState(false)

  const next = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams]
  )

  async function handleResend() {
    if (!email.trim()) {
      toast.error("Enter your email first.")
      return
    }

    const result = await sendVerificationOtp(email.trim())
    if (!result.ok) {
      toast.error(result.envelope.message ?? "Could not send code.")
      return
    }
    toast.success("Verification code sent.")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setPending(true)

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
        setPending(false)
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
      setPending(false)
    }
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
        <Link href="/" className="inline-flex items-center gap-2 font-medium">
          <SquaresFourIcon className="size-5 text-primary" weight="fill" />
          <span>daaysorn</span>
        </Link>
      </header>

      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Verify email</h1>
        <p className="text-sm text-muted-foreground">
          Enter the six-digit code we sent to your inbox.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Verification code</label>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button type="submit" className="w-full" disabled={pending || otp.length !== 6}>
          {pending ? "Verifying..." : "Verify email"}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={handleResend}>
          Resend code
        </Button>
      </form>
    </div>
  )
}

export { VerifyEmailForm }
