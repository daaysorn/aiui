"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { AuthBrand } from "@/components/auth/auth-brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/api/client"
import { captchaHeaders } from "@/lib/api/fetch"
import { setOtpResendCooldown } from "@/lib/auth/otp-resend-cooldown"
import { authCopy, siteRoutes } from "@/lib/site"

import { PasswordInput } from "./password-input"
import {
  getSignUpFieldErrors,
  signUpSchema,
  type SignUpFieldErrors,
} from "./sign-up-schema"
import { TurnstileField } from "./turnstile-field"

function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const parsed = signUpSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      captchaToken: captchaToken ?? "",
    })

    if (!parsed.success) {
      setFieldErrors(getSignUpFieldErrors(parsed.error))
      return
    }

    setFieldErrors({})
    setPending(true)

    try {
      const result = await authClient.signUp.email({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: siteRoutes.dashboard,
        fetchOptions: { headers: captchaHeaders(parsed.data.captchaToken) },
      })

      if (result.error) {
        toast.error(result.error.message ?? "Sign up failed.")
        setPending(false)
        return
      }

      toast.success("Account created. Verify your email.")
      setOtpResendCooldown(parsed.data.email)
      router.push(
        `${siteRoutes.verifyEmail}?email=${encodeURIComponent(parsed.data.email)}`
      )
    } catch {
      toast.error("Sign up failed. Try again.")
      setPending(false)
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <AuthBrand />
        <Button variant="outline" size="sm" render={<Link href={siteRoutes.signIn} />}>
          Sign in
        </Button>
      </header>

      <div className="flex min-w-0 flex-col gap-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight xs:text-3xl">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start with email. We send a six-digit code to verify you.
        </p>
      </div>

      <form className="flex min-w-0 flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            autoComplete="name"
            placeholder={authCopy.placeholders.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {fieldErrors.name ? (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={authCopy.placeholders.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            showStrength
            autoComplete="new-password"
            placeholder={authCopy.placeholders.newPassword}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {fieldErrors.confirmPassword ? (
            <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <TurnstileField
            onChange={(token) => {
              setCaptchaToken(token)
              if (token && fieldErrors.captchaToken) {
                setFieldErrors((current) => ({
                  ...current,
                  captchaToken: undefined,
                }))
              }
            }}
          />
          {fieldErrors.captchaToken ? (
            <p className="text-xs text-destructive">{fieldErrors.captchaToken}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" loading={pending}>
          Create account
        </Button>
      </form>
    </div>
  )
}

export { SignUpForm }
