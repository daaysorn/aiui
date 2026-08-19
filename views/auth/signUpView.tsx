"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthField, AuthMessage, AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export function SignUpView() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    })

    setPending(false)

    if (result.error) {
      setError(result.error.message ?? "Sign up failed")
      return
    }

    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <AuthShell
      title="Create account"
      description="Start with email. We will send a six-digit code to verify you."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        <AuthField label="Name" htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </AuthField>
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
        <AuthField label="Password" htmlFor="password" hint="At least 8 characters.">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </AuthField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  )
}
