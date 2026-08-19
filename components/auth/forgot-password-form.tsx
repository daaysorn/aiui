"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { SquaresFourIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authClient, persistSession } from "@/lib/api/client"
import { siteRoutes } from "@/lib/site"

import { PasswordInput } from "./password-input"

function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get("email")?.trim() ?? "")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<"email" | "reset">("email")
  const [pending, setPending] = useState(false)

  const resetToken = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams]
  )

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)

    const result = await authClient.emailOtp.requestPasswordReset({ email })
    setPending(false)

    if (result.error) {
      toast.error(result.error.message ?? "Could not send reset code.")
      return
    }

    toast.success("Reset code sent.")
    setStep("reset")
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)

    const result = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    })

    setPending(false)

    if (result.error) {
      toast.error(result.error.message ?? "Password reset failed.")
      return
    }

    const data = result.data as { token?: string; refreshToken?: string } | null
    if (data?.token) {
      await persistSession({
        token: data.token,
        refreshToken: data.refreshToken,
      })
      toast.success("Password updated.")
      router.push(siteRoutes.dashboard)
      router.refresh()
      return
    }

    toast.success("Password updated. Sign in with your new password.")
    router.push(siteRoutes.signIn)
  }

  async function handleTokenReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || !resetToken) return
    setPending(true)

    const result = await authClient.resetPassword({
      newPassword: password,
      token: resetToken,
    })

    setPending(false)

    if (result.error) {
      toast.error(result.error.message ?? "Password reset failed.")
      return
    }

    toast.success("Password updated.")
    router.push(siteRoutes.signIn)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 font-medium">
          <SquaresFourIcon className="size-5 text-primary" weight="fill" />
          <span>daaysorn</span>
        </Link>
        <Button variant="outline" size="sm" render={<Link href={siteRoutes.signIn} />}>
          Sign in
        </Button>
      </header>

      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          {resetToken
            ? "Choose a new password for your account."
            : step === "email"
              ? "We email a one-time code so you can choose a new password."
              : "Enter the code from your email and a new password."}
        </p>
      </div>

      {resetToken ? (
        <form className="space-y-4" onSubmit={handleTokenReset}>
          <PasswordInput
            showStrength
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Update password"}
          </Button>
        </form>
      ) : step === "email" ? (
        <form className="space-y-4" onSubmit={handleSendCode}>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending..." : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <PasswordInput
            showStrength
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          <Button type="submit" className="w-full" disabled={pending || otp.length !== 6}>
            {pending ? "Saving..." : "Update password"}
          </Button>
        </form>
      )}
    </div>
  )
}

export { ForgotPasswordForm }
