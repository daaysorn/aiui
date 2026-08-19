"use client"

import { useActionState, useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  BellIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  XIcon,
  type Icon,
} from "@phosphor-icons/react"

import { PlansDialog } from "@/components/dashboard/plans-dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useUserOverview } from "@/hooks/use-dashboard-query"
import { useSoundNotifications } from "@/hooks/use-sound-notifications"
import { playMoodCue } from "@/lib/chat-sounds"
import { isFreePlan } from "@/lib/billing"
import { queryKeys } from "@/lib/query/keys"
import { setSoundNotificationsEnabled } from "@/lib/sound-notifications"
import { cn } from "@/lib/utils"
import {
  changePasswordAction,
  updateProfileAction,
  type ChangePasswordState,
  type SettingsState,
} from "@/app/(dashboard)/dashboard/settings/actions"

export type SettingsSection = "account" | "billing" | "preferences" | "security"

const navItems: {
  id: SettingsSection
  label: string
  icon: Icon
}[] = [
  { id: "account", label: "Account", icon: UserCircleIcon },
  { id: "billing", label: "Billing", icon: CreditCardIcon },
  { id: "preferences", label: "Preferences", icon: BellIcon },
  { id: "security", label: "Security", icon: ShieldCheckIcon },
]

function formatCreditBalance(balance: number) {
  return new Intl.NumberFormat("en-US").format(balance)
}

function AccountPanel() {
  const { data: overview } = useUserOverview()
  const queryClient = useQueryClient()
  const [state, formAction, pending] = useActionState<SettingsState | null, FormData>(
    updateProfileAction,
    null
  )
  const user = overview?.user

  useEffect(() => {
    if (!state?.message) return
    void queryClient.invalidateQueries({ queryKey: queryKeys.overview })
  }, [queryClient, state?.message])

  if (!user) return null

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
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
        <label htmlFor="settings-email" className="text-sm font-medium">
          Email
        </label>
        <Input id="settings-email" value={user.email} disabled />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="settings-name" className="text-sm font-medium">
          Name
        </label>
        <Input id="settings-name" name="name" defaultValue={user.name} required />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="settings-username" className="text-sm font-medium">
          Username
        </label>
        <Input
          id="settings-username"
          name="username"
          defaultValue={user.username ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="settings-telephone" className="text-sm font-medium">
          Phone
        </label>
        <Input
          id="settings-telephone"
          name="telephone"
          defaultValue={user.telephone ?? ""}
        />
      </div>
      <Button type="submit" className="self-end" loading={pending}>
        Save changes
      </Button>
    </form>
  )
}

function BillingPanel() {
  const { data: overview } = useUserOverview()
  const [plansOpen, setPlansOpen] = useState(false)

  if (!overview) return null

  const planName = overview.billing.plan?.name ?? "Free"
  const creditBalance = overview.billing.credits.balance
  const showUpgrade = isFreePlan(overview.billing.plan)

  return (
    <div className="flex max-w-lg flex-col gap-3">
      <div className="rounded-xl bg-muted p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Plan
        </p>
        <p className="mt-2 font-heading text-2xl font-semibold">{planName}</p>
      </div>
      <div className="rounded-xl bg-muted p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Credits
        </p>
        <p className="mt-2 font-heading text-2xl font-semibold">
          {formatCreditBalance(creditBalance)}
        </p>
      </div>
      {showUpgrade ? (
        <>
          <Button className="self-end" onClick={() => setPlansOpen(true)}>
            Upgrade
          </Button>
          <PlansDialog open={plansOpen} onOpenChange={setPlansOpen} />
        </>
      ) : null}
    </div>
  )
}

function PreferencesPanel() {
  const soundEnabled = useSoundNotifications()

  function handleSoundChange(checked: boolean) {
    setSoundNotificationsEnabled(checked)
    if (checked) playMoodCue("complete")
  }

  return (
    <div className="flex max-w-lg flex-col gap-3">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-muted p-5">
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
      <div className="flex flex-col gap-3 rounded-xl bg-muted p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium">Appearance</p>
          <p className="text-sm text-muted-foreground">Light, dark, or system.</p>
        </div>
        <ThemeToggleRow variant="cards" />
      </div>
    </div>
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
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
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
          New
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
      <Button type="submit" className="self-end" loading={pending} disabled={!canSubmit}>
        Change password
      </Button>
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
  const active = navItems.find((item) => item.id === section) ?? navItems[0]
  const descriptions: Record<SettingsSection, string> = {
    account: "Update your profile details.",
    billing: "Plan and credit balance.",
    preferences: "Sound and appearance.",
    security: "Use a strong password.",
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
        overlayClassName="bg-black/60 supports-backdrop-filter:backdrop-blur-sm"
        className="flex h-[min(36rem,90svh)] w-full max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-3xl bg-background p-0 shadow-lg outline-solid outline-1 -outline-offset-1 outline-border sm:max-w-4xl sm:flex-row"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Account billing preferences and security.
        </DialogDescription>
        <aside className="flex shrink-0 flex-col gap-3 bg-background p-4 sm:w-52">
          <p className="px-2 font-heading text-lg font-semibold">Settings</p>
          <nav className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === section
              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground",
                    isActive && "bg-muted text-foreground"
                  )}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="size-4" weight={isActive ? "fill" : "duotone"} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>
        <div aria-hidden className="h-px bg-border sm:h-auto sm:w-px" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              Settings <span className="text-foreground">/ {active.label}</span>
            </p>
            <DialogClose
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
            <div className="mb-5 flex flex-col gap-1">
              <h2 className="font-heading text-lg font-semibold">{active.label}</h2>
              <p className="text-sm text-muted-foreground">{descriptions[section]}</p>
            </div>
            {section === "account" ? <AccountPanel /> : null}
            {section === "billing" ? <BillingPanel /> : null}
            {section === "preferences" ? <PreferencesPanel /> : null}
            {section === "security" ? <SecurityPanel /> : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsDialog }
