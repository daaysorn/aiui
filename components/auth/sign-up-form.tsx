"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FaGithub } from "react-icons/fa6"
import { FcGoogle } from "react-icons/fc"
import { toast } from "sonner"

import { AuthBrand } from "@/components/auth/auth-brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLastAuthMethod } from "@/hooks/use-last-auth-method"
import { authClient } from "@/lib/api/client"
import { captchaHeaders } from "@/lib/api/fetch"
import { setOtpResendCooldown } from "@/lib/auth/otp-resend-cooldown"
import { setPendingVerifyEmail } from "@/lib/auth/pending-verify-email"
import {
  buildAuthCallbackURL,
  getSafeNextPath,
  resolveSocialAuthErrorMessage,
  authCopy,
  siteRoutes,
} from "@/lib/site"

import { PasswordInput } from "./password-input"
import {
  getSignUpFieldErrors,
  signUpSchema,
  type SignUpFieldErrors,
} from "./sign-up-schema"
import { SocialAuthButton } from "./social-auth-button"
import { TurnstileField } from "./turnstile-field"

function AuthDivider() {
  return (
    <div className="relative pt-1 pb-0">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs tracking-wide text-muted-foreground">
          or
        </span>
      </div>
    </div>
  )
}

type PendingAction = "google" | "github" | "email" | null

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lastUsed = useLastAuthMethod()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({})
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (!error) return
    const toastKey = `aiui:oauth-error:${error}`
    if (sessionStorage.getItem(toastKey) === "1") return
    sessionStorage.setItem(toastKey, "1")
    window.setTimeout(() => sessionStorage.removeItem(toastKey), 2500)
    toast.error(resolveSocialAuthErrorMessage(searchParams))
  }, [searchParams])

  async function handleSocialSignIn(provider: "google" | "github") {
    if (pendingAction) return
    setPendingAction(provider)
    try {
      const next = getSafeNextPath(searchParams.get("next"))
      const callbackURL = buildAuthCallbackURL({
        origin: window.location.origin,
        next,
        method: provider,
      })
      const errorCallbackURL = `${window.location.origin}${siteRoutes.signUp}`

      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL,
        newUserCallbackURL: callbackURL,
      })

      if (error) {
        toast.error(error.message ?? "Social sign in failed.")
        setPendingAction(null)
        return
      }

      const url =
        data && typeof data === "object" && "url" in data
          ? String((data as { url?: string }).url ?? "")
          : ""

      if (!url) {
        toast.error("Social sign in failed.")
        setPendingAction(null)
        return
      }

      window.location.assign(url)
    } catch {
      toast.error("Social sign in failed. Try again.")
      setPendingAction(null)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingAction) return

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
    setPendingAction("email")

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
        setPendingAction(null)
        return
      }

      toast.success("Account created. Verify your email.")
      setOtpResendCooldown(parsed.data.email)
      setPendingVerifyEmail(parsed.data.email)
      router.push(siteRoutes.verifyEmail)
    } catch {
      toast.error("Sign up failed. Try again.")
      setPendingAction(null)
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

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <SocialAuthButton
          label="Google"
          icon={<FcGoogle className="size-5" aria-hidden />}
          onClick={() => handleSocialSignIn("google")}
          loading={pendingAction === "google"}
          disabled={pendingAction !== null && pendingAction !== "google"}
          lastUsed={lastUsed === "google"}
        />
        <SocialAuthButton
          label="GitHub"
          icon={<FaGithub className="size-5" aria-hidden />}
          onClick={() => handleSocialSignIn("github")}
          loading={pendingAction === "github"}
          disabled={pendingAction !== null && pendingAction !== "github"}
          lastUsed={lastUsed === "github"}
        />
      </div>

      <AuthDivider />

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

        <Button
          type="submit"
          className="w-full"
          loading={pendingAction === "email"}
          disabled={pendingAction !== null && pendingAction !== "email"}
        >
          Create account
        </Button>
      </form>
    </div>
  )
}

export { SignUpForm }
