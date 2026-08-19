"use client"

import { useState } from "react"

import { AuthField, AuthMessage } from "@/components/auth/auth-shell"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SessionUser } from "@/lib/api/types"
import { updateProfile } from "@/lib/api/user"

export function SettingsView({ user }: { user: SessionUser }) {
  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username ?? "")
  const [telephone, setTelephone] = useState(user.telephone ?? "")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)

    try {
      await updateProfile({
        name,
        username: username || undefined,
        telephone: telephone || undefined,
      })
      setMessage("Profile updated.")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update profile")
    } finally {
      setPending(false)
    }
  }

  return (
    <DashboardSection
      title="Settings"
      description="Profile details for your daaysorn account."
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6"
      >
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
        <AuthField label="Email" htmlFor="email">
          <Input id="email" value={user.email} disabled />
        </AuthField>
        <AuthField label="Name" htmlFor="name">
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </AuthField>
        <AuthField label="Username" htmlFor="username">
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </AuthField>
        <AuthField label="Phone" htmlFor="telephone">
          <Input
            id="telephone"
            value={telephone}
            onChange={(event) => setTelephone(event.target.value)}
          />
        </AuthField>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </DashboardSection>
  )
}
