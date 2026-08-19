"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { AuthField, AuthMessage, AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { envelopeCode } from "@/lib/api/envelope"
import { authClient } from "@/lib/auth-client"

export function SignInView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    })

    setPending(false)

    if (result.error) {
      setError(result.error.message ?? "Sign in failed")
      return
    }

    const data = result.data as Record<string, unknown> | undefined
    if (envelopeCode(data) === "EMAIL_NOT_VERIFIED") {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  async function handleSocial(provider: "google" | "github") {
    setError(null)
    await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl,
    })
  }

  return (
    <AuthShell
      title="Sign in"
      description="Use your daaysorn account to open the builder dashboard."
      footer={
        <p>
          New here?{" "}
          <Link href="/auth/sign-up" className="text-primary underline-offset-4 hover:underline">
            Create an account
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
        <AuthField label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </AuthField>
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Or continue with</p>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={() => handleSocial("google")}>
            Google
          </Button>
          <Button type="button" variant="outline" onClick={() => handleSocial("github")}>
            GitHub
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
