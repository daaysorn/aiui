"use client"

import { useActionState } from "react"

import {
  updateProfileAction,
  type SettingsState,
} from "@/app/(dashboard)/dashboard/settings/actions"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSoundNotifications } from "@/hooks/use-sound-notifications"
import type { SessionUser } from "@/lib/api/types"
import { playMoodCue } from "@/lib/chat-sounds"
import { setSoundNotificationsEnabled } from "@/lib/sound-notifications"

export function SettingsView({ user }: { user: SessionUser }) {
  const [state, formAction, pending] = useActionState<SettingsState | null, FormData>(
    updateProfileAction,
    null
  )
  const soundEnabled = useSoundNotifications()

  function handleSoundChange(checked: boolean) {
    setSoundNotificationsEnabled(checked)
    if (checked) playMoodCue("complete")
  }

  return (
    <DashboardSection
      title="Settings"
      description="Profile and sound notifications"
    >
      <form
        action={formAction}
        className="flex max-w-xl flex-col gap-4 rounded-xl bg-card p-6"
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
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" value={user.email} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            defaultValue={user.username ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
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

      <div className="flex max-w-xl items-center justify-between gap-4 rounded-xl bg-muted p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="sound-notifications">Sound notifications</Label>
          <p className="text-sm text-muted-foreground">Thinking and reply cues</p>
        </div>
        <Switch
          id="sound-notifications"
          checked={soundEnabled}
          onCheckedChange={handleSoundChange}
        />
      </div>
    </DashboardSection>
  )
}
