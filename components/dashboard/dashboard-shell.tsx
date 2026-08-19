"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { signOutUser } from "@/lib/api/user"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/settings", label: "Settings" },
] as const

type DashboardShellProps = {
  userName: string
  userEmail: string
  children: ReactNode
}

export function DashboardShell({
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOutUser().catch(() => undefined)
    await authClient.signOut()
    router.push("/auth/sign-in")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh min-w-0 bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card/40 p-4 md:flex md:flex-col">
        <div className="mb-8 space-y-1">
          <Link href="/dashboard" className="font-heading text-base font-semibold">
            daaysorn
          </Link>
          <p className="text-xs text-muted-foreground">Builder dashboard</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Link href="/dashboard" className="font-heading text-sm font-semibold">
            daaysorn
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
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
    <section className="mx-auto w-full max-w-5xl min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
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
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
