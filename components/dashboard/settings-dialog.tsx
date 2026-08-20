"use client"

import { useActionState, useEffect, useState } from "react"
import {
  BellIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DesktopIcon,
  LinkIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserCircleIcon,
  XIcon,
  type Icon,
} from "@phosphor-icons/react"

import { AccountPanel } from "@/components/dashboard/account-panel"
import { AdvancedPanel } from "@/components/dashboard/advanced-panel"
import { BillingSettingsPanel } from "@/components/billing/billing-settings-panel"
import { LinkedAccountsPanel } from "@/components/dashboard/linked-accounts-panel"
import { SessionsPanel } from "@/components/dashboard/sessions-panel"
import {
  SettingsCard,
  SettingsNotice,
  SettingsPanel,
} from "@/components/dashboard/settings-ui"
import { ThemeToggleRow } from "@/components/dashboard/theme-toggle-row"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSoundNotifications } from "@/hooks/use-sound-notifications"
import { playMoodCue } from "@/lib/chat-sounds"
import { setSoundNotificationsEnabled } from "@/lib/sound-notifications"
import { cn } from "@/lib/utils"
import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/app/(dashboard)/dashboard/settings/actions"

export type SettingsSection =
  | "account"
  | "billing"
  | "preferences"
  | "security"
  | "linked-accounts"
  | "sessions"
  | "advanced"

type NavItem = {
  id: SettingsSection
  label: string
  icon: Icon
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Profile",
    items: [
      { id: "account", label: "Account", icon: UserCircleIcon },
      { id: "billing", label: "Billing", icon: CreditCardIcon },
      { id: "preferences", label: "Preferences", icon: BellIcon },
    ],
  },
  {
    label: "Security",
    items: [
      { id: "security", label: "Password", icon: ShieldCheckIcon },
      { id: "linked-accounts", label: "Linked accounts", icon: LinkIcon },
      { id: "sessions", label: "Sessions", icon: DesktopIcon },
    ],
  },
  {
    label: "Account",
    items: [{ id: "advanced", label: "Advanced", icon: SlidersHorizontalIcon }],
  },
]

const allNavItems = navGroups.flatMap((group) => group.items)

function PreferencesPanel() {
  const soundEnabled = useSoundNotifications()

  function handleSoundChange(checked: boolean) {
    setSoundNotificationsEnabled(checked)
    if (checked) playMoodCue("complete")
  }

  return (
    <SettingsPanel>
      <SettingsCard title="Notifications" description="Control audio feedback in chat.">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor="settings-sound">Sound notifications</Label>
            <p className="text-sm text-muted-foreground">Thinking and reply cues</p>
          </div>
          <Switch
            id="settings-sound"
            checked={soundEnabled}
            onCheckedChange={handleSoundChange}
          />
        </div>
      </SettingsCard>
      <SettingsCard title="Appearance" description="Light, dark, or system.">
        <ThemeToggleRow variant="cards" />
      </SettingsCard>
    </SettingsPanel>
  )
}

function SecurityPanel() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [state, formAction, pending] = useActionState<
    ChangePasswordState | null,
    FormData
  >(changePasswordAction, null)

  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword
  const canSubmit =
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    newPassword === confirmPassword

  const checks = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", ok: /[a-z]/.test(newPassword) },
    { label: "One number", ok: /\d/.test(newPassword) },
  ]

  useEffect(() => {
    if (!state?.message) return
    setNewPassword("")
    setConfirmPassword("")
  }, [state?.message])

  return (
    <form action={formAction}>
      <SettingsPanel>
        {state?.error ? <SettingsNotice tone="error">{state.error}</SettingsNotice> : null}
        {state?.message ? (
          <SettingsNotice tone="success">{state.message}</SettingsNotice>
        ) : null}
        <SettingsCard title="Change password" description="Use a strong unique password.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current password
              </label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                required
                minLength={8}
                showStrength
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <ul className="grid grid-cols-1 gap-1.5 xs:grid-cols-2">
                {checks.map((check) => (
                  <li
                    key={check.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      check.ok ? "text-success" : "text-muted-foreground"
                    )}
                  >
                    <CheckCircleIcon
                      className="size-3.5 shrink-0"
                      weight={check.ok ? "fill" : "regular"}
                    />
                    {check.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={passwordsMismatch || undefined}
              />
              {passwordsMismatch ? (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="self-start"
              loading={pending}
              disabled={!canSubmit}
            >
              Update password
            </Button>
          </div>
        </SettingsCard>
      </SettingsPanel>
    </form>
  )
}

function SettingsDialog({
  open,
  onOpenChange,
  section,
  onSectionChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}) {
  const active = allNavItems.find((item) => item.id === section) ?? allNavItems[0]
  const descriptions: Record<SettingsSection, string> = {
    account: "Photo, name, and contact details.",
    billing: "Plan, credits, and upgrades.",
    preferences: "Sound and appearance.",
    security: "Update your sign-in password.",
    "linked-accounts": "Connect Google or GitHub.",
    sessions: "Review signed-in devices.",
    advanced: "Sign out or delete account.",
  }

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen && eventDetails.reason === "escape-key") {
          return
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-md"
        className="flex h-[min(44rem,92svh)] w-full max-w-[calc(100%-1rem)] flex-col overflow-hidden rounded-3xl bg-background p-0 shadow-lg sm:max-w-5xl sm:flex-row"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Account billing preferences and security.
        </DialogDescription>

        <aside className="flex shrink-0 flex-col gap-5 bg-background p-4 sm:w-60 sm:p-5 lg:w-64">
          <div className="flex items-center justify-between gap-2 px-1 sm:hidden">
            <p className="font-heading text-lg font-semibold tracking-tight">Settings</p>
            <DialogClose render={<Button variant="ghost" size="icon-sm" />}>
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <p className="hidden px-1 font-heading text-xl font-semibold tracking-tight sm:block">
            Settings
          </p>

          <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1.5">
                <p className="px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {group.label}
                </p>
                <div className="flex gap-1 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = item.id === section
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          "flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                        onClick={() => onSectionChange(item.id)}
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            isActive ? "bg-primary/10 text-primary" : "bg-muted/80"
                          )}
                        >
                          <Icon className="size-4" weight={isActive ? "fill" : "duotone"} />
                        </span>
                        <span className="truncate font-medium">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div aria-hidden className="h-px bg-border sm:h-auto sm:w-px" />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
          <header className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 pb-2 sm:px-8 sm:pt-8">
            <div className="min-w-0 flex flex-col gap-1.5">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {active.label}
              </h2>
              <p className="text-sm text-muted-foreground">{descriptions[section]}</p>
            </div>
            <DialogClose
              render={<Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex" />}
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 sm:px-8 sm:pb-10">
            {section === "account" ? <AccountPanel /> : null}
            {section === "billing" ? <BillingSettingsPanel /> : null}
            {section === "preferences" ? <PreferencesPanel /> : null}
            {section === "security" ? <SecurityPanel /> : null}
            {section === "linked-accounts" ? <LinkedAccountsPanel /> : null}
            {section === "sessions" ? <SessionsPanel /> : null}
            {section === "advanced" ? <AdvancedPanel /> : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsDialog }
