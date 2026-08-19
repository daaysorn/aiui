"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState, type ReactNode } from "react"
import {
  FolderIcon,
  GearIcon,
  MoonIcon,
  PlusIcon,
  RobotIcon,
  SignOutIcon,
  SquaresFourIcon,
  SunIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { upgradeToProAction } from "@/app/(dashboard)/dashboard/actions"

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
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { clearSession } from "@/lib/api/client"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: SquaresFourIcon, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderIcon, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: GearIcon, exact: false },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <DropdownMenuItem
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
      {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
    </DropdownMenuItem>
  )
}

type DashboardShellProps = {
  userName: string
  userImage: string | null
  planName: string
  creditBalance: number
  showUpgrade?: boolean
  children: ReactNode
}

function formatCreditBalance(balance: number) {
  return new Intl.NumberFormat("en-US").format(balance)
}

export function DashboardShell({
  userName,
  userImage,
  planName,
  creditBalance,
  showUpgrade = false,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [upgrading, setUpgrading] = useState(false)

  async function handleSignOut() {
    await clearSession()
    router.push("/sign-in")
    router.refresh()
  }

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const result = await upgradeToProAction()
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.ok) {
        toast.success("You're on Pro.")
        router.refresh()
      }
    } finally {
      setUpgrading(false)
    }
  }

  const nameParts = userName.trim().split(/\s+/).filter(Boolean)
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : userName.slice(0, 2).toUpperCase()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <RobotIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-heading font-semibold">daaybot</span>
                  <span className="text-xs text-muted-foreground">Builder</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="px-2 pt-1">
            <Button
              size="sm"
              className="w-full justify-start gap-2"
              render={<Link href="/dashboard/projects/new" />}
            >
              <PlusIcon className="size-4" />
              New project
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href)
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton isActive={active} render={<Link href={href} />}>
                        <Icon />
                        {label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex min-w-0 items-center gap-2 rounded-lg p-1.5 outline-solid outline-1 outline-transparent transition-colors hover:bg-sidebar-accent hover:outline-border has-data-open:bg-sidebar-accent has-data-open:outline-border">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 overflow-hidden text-left outline-none">
                <Avatar className="size-8">
                  {userImage ? (
                    <AvatarImage src={userImage} alt={userName} />
                  ) : null}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex w-0 min-w-0 flex-1 flex-col gap-0.5 leading-none">
                  <span className="truncate text-sm font-semibold">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {planName} · {formatCreditBalance(creditBalance)} credits
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <ThemeToggle />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleSignOut()}>
                  <SignOutIcon className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {showUpgrade ? (
              <Button
                variant="ghost"
                size="xs"
                className="shrink-0 rounded-full px-3 text-foreground outline-solid outline-1 outline-border hover:bg-transparent hover:text-foreground active:translate-y-0"
                loading={upgrading}
                onClick={() => void handleUpgrade()}
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
