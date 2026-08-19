"use client"

import { useActionState } from "react"

import {
  updateProfileAction,
  type SettingsState,
} from "@/app/(dashboard)/dashboard/settings/actions"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SessionUser } from "@/lib/api/types"

export function SettingsView({ user }: { user: SessionUser }) {
  const [state, formAction, pending] = useActionState<SettingsState | null, FormData>(
    updateProfileAction,
    null
  )

  return (
    <DashboardSection
      title="Settings"
      description="Profile details for your daaybot account."
    >
      <form
        action={formAction}
        className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6"
      >
        {state?.error ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        {state?.message ? (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
            {state.message}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" value={user.email} disabled />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </div>
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            defaultValue={user.username ?? ""}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="telephone" className="text-sm font-medium">
            Phone
          </label>
          <Input
            id="telephone"
            name="telephone"
            defaultValue={user.telephone ?? ""}
          />
        </div>
        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </form>
    </DashboardSection>
  )
}
