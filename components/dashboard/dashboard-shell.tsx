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
import { toast } from "sonner"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { formatCredits } from "@/lib/billing"
import { isFreePlan } from "@/lib/billing"
import { useBillingCheckoutReturn } from "@/hooks/use-billing-checkout-return"
import { useUserOverview } from "@/hooks/use-dashboard-query"

type DashboardShellProps = {
  userName: string
  userImage: string | null
  planName: string
  creditBalance: number
  showUpgrade?: boolean
  children: ReactNode
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
      {planName} · {formatCredits(creditBalance)} credits
    </>
  )
}

export function DashboardShell({
  userName,
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
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>(
    urlSection ?? "account"
  )

  const { data: overview } = useUserOverview()
  useBillingCheckoutReturn()

  const displayPlanName = overview?.billing.plan?.name ?? planName
  const displayCreditBalance =
    overview?.billing.credits.balance ?? creditBalance
  const displayShowUpgrade = overview
    ? isFreePlan(overview.billing.plan)
    : showUpgrade

  useEffect(() => {
    if (!urlSection) return
    if (searchParams.get("checkout")) return
    router.replace("/dashboard")
  }, [urlSection, router, searchParams])

  function openSettings(section: SettingsSection) {
    setSettingsSection(section)
    setSettingsOpen(true)
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await clearSession()
      setSignOutOpen(false)
      router.push("/sign-in")
      router.refresh()
    } catch {
      toast.error("Could not sign out.")
      setSigningOut(false)
    }
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
                  <span className="truncate text-sm font-semibold">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    <PlanCredits
                      planName={displayPlanName}
                      creditBalance={displayCreditBalance}
                    />
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
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      <PlanCredits
                      planName={displayPlanName}
                      creditBalance={displayCreditBalance}
                    />
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
                <DropdownMenuItem onClick={() => setSignOutOpen(true)}>
                  <SignOutIcon weight="duotone" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {displayShowUpgrade ? (
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
      {displayShowUpgrade ? (
        <PlansDialog open={plansOpen} onOpenChange={setPlansOpen} />
      ) : null}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        section={settingsSection}
        onSectionChange={setSettingsSection}
      />
      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">
              Log out?
            </DialogTitle>
            <DialogDescription>
              You will need to sign in again to use daaysorn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSignOutOpen(false)}>
              Cancel
            </Button>
            <Button loading={signingOut} onClick={() => void handleSignOut()}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  children?: ReactNode
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
