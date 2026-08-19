"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "@phosphor-icons/react"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSoundNotifications } from "@/hooks/use-sound-notifications"
import { playMoodCue } from "@/lib/chat-sounds"
import { setSoundNotificationsEnabled } from "@/lib/sound-notifications"

export function SettingsView() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const soundEnabled = useSoundNotifications()

  useEffect(() => setMounted(true), [])

  function handleSoundChange(checked: boolean) {
    setSoundNotificationsEnabled(checked)
    if (checked) playMoodCue("complete")
  }

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <DashboardSection title="Settings" description="Sound and appearance.">
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
      <div className="flex max-w-xl items-center justify-between gap-4 rounded-xl bg-muted p-6">
        <div className="flex min-w-0 items-center gap-2">
          {isDark ? (
            <SunIcon className="size-4 shrink-0" weight="duotone" />
          ) : (
            <MoonIcon className="size-4 shrink-0" weight="duotone" />
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <p className="text-sm text-muted-foreground">Press d to toggle</p>
          </div>
        </div>
        <Switch
          id="dark-mode"
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>
    </DashboardSection>
  )
}
