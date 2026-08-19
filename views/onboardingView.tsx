"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { AuthField, AuthMessage, AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { checkTelephone, checkUsername, completeOnboarding } from "@/lib/api/user"

export function OnboardingView() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [telephone, setTelephone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const [usernameCheck, telephoneCheck] = await Promise.all([
        checkUsername(username),
        checkTelephone(telephone),
      ])

      if (!usernameCheck.available) {
        setError("That username is already taken.")
        setPending(false)
        return
      }

      if (!telephoneCheck.available) {
        setError("That phone number is already in use.")
        setPending(false)
        return
      }

      await completeOnboarding({ username, telephone })
      router.push("/dashboard")
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save profile")
      setPending(false)
    }
  }

  return (
    <AuthShell
      title="Finish setup"
      description="Pick a username and phone number for your daaysorn account."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        <AuthField label="Username" htmlFor="username" hint="3 to 30 characters.">
          <Input
            id="username"
            autoComplete="username"
            minLength={3}
            maxLength={30}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </AuthField>
        <AuthField label="Phone" htmlFor="telephone">
          <Input
            id="telephone"
            type="tel"
            autoComplete="tel"
            required
            value={telephone}
            onChange={(event) => setTelephone(event.target.value)}
          />
        </AuthField>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving..." : "Continue to dashboard"}
        </Button>
      </form>
    </AuthShell>
  )
}
