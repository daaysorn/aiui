"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import {
  CaretRightIcon,
  CreditCardIcon,
  GearIcon,
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react"

import { AuthBrand } from "@/components/auth/auth-brand"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { PlansDialog } from "@/components/dashboard/plans-dialog"
import {
  SettingsDialog,
  type SettingsSection,
} from "@/components/dashboard/settings-dialog"
import { ThemeToggleRow } from "@/components/dashboard/theme-toggle-row"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { clearSession } from "@/lib/api/client"

type DashboardShellProps = {
  userName: string
  userHandle: string
  userImage: string | null
  planName: string
  creditBalance: number
  showUpgrade?: boolean
  children: ReactNode
}

function formatCreditBalance(balance: number) {
  return new Intl.NumberFormat("en-US").format(balance)
}

const settingsSections: SettingsSection[] = [
  "account",
  "billing",
  "preferences",
  "security",
  "linked-accounts",
  "sessions",
  "advanced",
]

function parseSettingsSection(value: string | null): SettingsSection | null {
  if (!value) return null
  return settingsSections.includes(value as SettingsSection)
    ? (value as SettingsSection)
    : null
}

function PlanCredits({
  planName,
  creditBalance,
}: {
  planName: string
  creditBalance: number
}) {
  return (
    <>
      {planName} · {formatCreditBalance(creditBalance)} credits
    </>
  )
}

export function DashboardShell({
  userName,
  userHandle,
  userImage,
  planName,
  creditBalance,
  showUpgrade = false,
  children,
}: DashboardShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSection = parseSettingsSection(searchParams.get("settings"))
  const [plansOpen, setPlansOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(Boolean(urlSection))
  const [settingsSection, setSettingsSection] = useState<SettingsSection>(
    urlSection ?? "account"
  )

  useEffect(() => {
    if (!urlSection) return
    router.replace("/dashboard")
  }, [urlSection, router])

  function openSettings(section: SettingsSection) {
    setSettingsSection(section)
    setSettingsOpen(true)
  }

  async function handleSignOut() {
    await clearSession()
    router.push("/sign-in")
    router.refresh()
  }

  const nameParts = userName.trim().split(/\s+/).filter(Boolean)
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : userName.slice(0, 2).toUpperCase()

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="px-2 py-1.5">
            <AuthBrand href="/dashboard" />
          </div>
        </SidebarHeader>

        <DashboardSidebar />

        <SidebarFooter>
          <div className="flex min-w-0 items-center gap-2 rounded-lg p-1.5 outline-solid outline-1 outline-transparent transition-colors hover:bg-sidebar-accent hover:outline-border has-data-open:bg-sidebar-accent has-data-open:outline-border">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 overflow-hidden text-left outline-none">
                <Avatar className="size-8 overflow-hidden">
                  <AvatarImage src={userImage ?? undefined} alt={userName} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex w-0 min-w-0 flex-1 flex-col gap-0.5 leading-none">
                  <span className="truncate text-sm font-semibold">{userHandle}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    <PlanCredits planName={planName} creditBalance={creditBalance} />
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                className="w-56 rounded-2xl p-1.5"
              >
                <DropdownMenuItem
                  className="gap-3 rounded-xl py-2"
                  onClick={() => openSettings("account")}
                >
                  <Avatar className="size-8 overflow-hidden">
                    <AvatarImage src={userImage ?? undefined} alt={userName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none">
                    <span className="truncate font-semibold">{userHandle}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      <PlanCredits planName={planName} creditBalance={creditBalance} />
                    </span>
                  </div>
                  <CaretRightIcon className="ml-auto size-4" weight="bold" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openSettings("account")}>
                  <UserCircleIcon weight="duotone" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openSettings("billing")}>
                  <CreditCardIcon weight="duotone" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openSettings("preferences")}>
                  <GearIcon weight="duotone" />
                  Settings
                </DropdownMenuItem>
                <div className="px-1 py-1.5">
                  <ThemeToggleRow />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleSignOut()}>
                  <SignOutIcon weight="duotone" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {showUpgrade ? (
              <Button
                variant="ghost"
                size="xs"
                className="shrink-0 rounded-full px-3 text-foreground outline-solid outline-1 outline-border hover:bg-transparent hover:text-foreground active:translate-y-0"
                onClick={() => setPlansOpen(true)}
              >
                Upgrade
              </Button>
            ) : null}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
      {showUpgrade ? (
        <PlansDialog open={plansOpen} onOpenChange={setPlansOpen} />
      ) : null}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        section={settingsSection}
        onSectionChange={setSettingsSection}
      />
    </SidebarProvider>
  )
}

export function DashboardSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mx-auto w-full max-w-4xl min-w-0 flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl bg-muted p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
