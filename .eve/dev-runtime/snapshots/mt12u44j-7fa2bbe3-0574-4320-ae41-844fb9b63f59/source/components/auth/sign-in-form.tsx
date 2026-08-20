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
import { isEmailIdentifier } from "@/lib/api/auth"
import {
  authClient,
  persistSession,
  rememberPendingAuthMethod,
  syncLastUsedLoginMethodCookie,
} from "@/lib/api/client"
import { captchaHeaders } from "@/lib/api/fetch"
import { envelopeCode } from "@/lib/api/envelope"
import { setPendingResetEmail } from "@/lib/auth/pending-reset-email"
import { setPendingVerifyEmail } from "@/lib/auth/pending-verify-email"
import { LegalLink } from "@/components/auth/legal-link"
import {
  buildAuthCallbackURL,
  getSafeNextPath,
  resolveSocialAuthErrorMessage,
  authCopy,
  siteRoutes,
} from "@/lib/site"

import { PasswordInput } from "./password-input"
import {
  getSignInFieldErrors,
  signInSchema,
  type SignInFieldErrors,
} from "./sign-in-schema"
import { SocialAuthButton } from "./social-auth-button"
import { LastUsedBadge } from "./last-used-badge"
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

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lastUsed = useLastAuthMethod()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({})
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
    rememberPendingAuthMethod(provider)

    try {
      const next = getSafeNextPath(searchParams.get("next"))
      const callbackURL = buildAuthCallbackURL({
        origin: window.location.origin,
        next,
        method: provider,
      })
      const errorCallbackURL = `${window.location.origin}${siteRoutes.signIn}`

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

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingAction) return

    const parsed = signInSchema.safeParse({
      identifier,
      password,
      captchaToken: captchaToken ?? "",
    })
    if (!parsed.success) {
      setFieldErrors(getSignInFieldErrors(parsed.error))
      return
    }

    setFieldErrors({})
    setPendingAction("email")

    try {
      const headers = captchaHeaders(parsed.data.captchaToken)
      const result = isEmailIdentifier(parsed.data.identifier)
        ? await authClient.signIn.email({
            email: parsed.data.identifier,
            password: parsed.data.password,
            fetchOptions: { headers },
          })
        : await authClient.signIn.username({
            username: parsed.data.identifier,
            password: parsed.data.password,
            fetchOptions: { headers },
          })

      if (result.error) {
        toast.error(result.error.message ?? "Sign in failed.")
        setPendingAction(null)
        return
      }

      const data = result.data as {
        token?: string
        refreshToken?: string
        code?: string
      } | null

      if (envelopeCode(data) === "EMAIL_NOT_VERIFIED") {
        if (isEmailIdentifier(parsed.data.identifier)) {
          setPendingVerifyEmail(parsed.data.identifier)
        }
        router.push(siteRoutes.verifyEmail)
        return
      }

      if (!data?.token) {
        toast.error("Sign in succeeded but no session token returned.")
        setPendingAction(null)
        return
      }

      await persistSession({
        token: data.token,
        refreshToken: data.refreshToken,
      })
      syncLastUsedLoginMethodCookie("email")
      toast.success("Signed in.")
      router.push(getSafeNextPath(searchParams.get("next")))
      router.refresh()
    } catch {
      toast.error("Sign in failed. Try again.")
      setPendingAction(null)
    }
  }

  function rememberResetEmail() {
    const value = identifier.trim()
    if (value && isEmailIdentifier(value)) {
      setPendingResetEmail(value)
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <header className="flex items-center justify-between gap-4">
        <AuthBrand />
        <Button variant="outline" size="sm" render={<Link href={siteRoutes.signUp} />}>
          Create account
        </Button>
      </header>

      <div className="flex min-w-0 flex-col gap-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight xs:text-3xl">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Use your Daaybot account to open the builder dashboard.
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

      <form className="flex min-w-0 flex-col gap-4" onSubmit={handleSignIn}>
        <div className="space-y-2">
          <label htmlFor="identifier" className="text-sm font-medium">
            Email or username
          </label>
          <Input
            id="identifier"
            autoComplete="username"
            placeholder={authCopy.placeholders.identifier}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            aria-invalid={Boolean(fieldErrors.identifier)}
          />
          {fieldErrors.identifier ? (
            <p className="text-xs text-destructive">{fieldErrors.identifier}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <LegalLink
              href={siteRoutes.forgotPassword}
              className="text-xs text-muted-foreground"
              onClick={rememberResetEmail}
            >
              Forgot password?
            </LegalLink>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={authCopy.placeholders.password}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          {fieldErrors.password ? (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
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

        <div className="relative min-w-0">
          {lastUsed === "email" ? <LastUsedBadge /> : null}
          <Button
            type="submit"
            className="w-full"
            loading={pendingAction === "email"}
            disabled={pendingAction !== null && pendingAction !== "email"}
          >
            Sign in
          </Button>
        </div>
      </form>
    </div>
  )
}

export { SignInForm }
