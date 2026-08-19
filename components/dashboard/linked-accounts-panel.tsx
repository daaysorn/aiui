"use client"

import { useEffect, useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { GithubLogoIcon, GoogleLogoIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  startLinkAccountAction,
  unlinkAccountAction,
} from "@/app/(dashboard)/dashboard/settings/actions"
import { Button } from "@/components/ui/button"
import { useLinkedAccounts } from "@/hooks/use-dashboard-query"
import { queryKeys } from "@/lib/query/keys"

const linkProviders = [
  { id: "google" as const, label: "Google", icon: GoogleLogoIcon },
  { id: "github" as const, label: "GitHub", icon: GithubLogoIcon },
]

function providerLabel(providerId: string) {
  if (providerId === "google") return "Google"
  if (providerId === "github") return "GitHub"
  if (providerId === "credential") return "Email and password"
  return providerId
}

function LinkedAccountsPanel() {
  const { data: accounts = [], isLoading } = useLinkedAccounts()
  const queryClient = useQueryClient()
  const [pendingProvider, setPendingProvider] = useState<string | null>(null)
  const [pendingUnlink, setPendingUnlink] = useState<string | null>(null)
  const [, startUnlink] = useTransition()

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts })
  }, [queryClient])

  async function handleLink(provider: "google" | "github") {
    setPendingProvider(provider)
    try {
      const callbackURL = `${window.location.origin}/dashboard?settings=linked-accounts`
      const result = await startLinkAccountAction(provider, callbackURL)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) {
        window.location.assign(result.url)
      }
    } catch {
      toast.error("Could not start account link.")
    } finally {
      setPendingProvider(null)
    }
  }

  function handleUnlink(providerId: string) {
    setPendingUnlink(providerId)
    startUnlink(async () => {
      const result = await unlinkAccountAction(providerId)
      setPendingUnlink(null)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.message ?? "Account unlinked.")
      await queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts })
    })
  }

  const linkedIds = new Set(accounts.map((account) => account.providerId))

  return (
    <div className="flex max-w-lg flex-col gap-3">
      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl bg-muted p-5 text-sm text-muted-foreground">
          <SpinnerGapIcon className="size-4 animate-spin" aria-hidden />
          Loading linked accounts…
        </div>
      ) : null}

      {!isLoading && accounts.length === 0 ? (
        <div className="rounded-xl bg-muted p-5 text-sm text-muted-foreground">
          No linked accounts yet.
        </div>
      ) : null}

      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center justify-between gap-4 rounded-xl bg-muted p-5"
        >
          <div className="min-w-0 flex flex-col gap-1">
            <p className="text-sm font-medium">{providerLabel(account.providerId)}</p>
            <p className="truncate text-xs text-muted-foreground">
              Connected {new Date(account.createdAt).toLocaleDateString()}
            </p>
          </div>
          {account.providerId === "credential" ? null : (
            <Button
              variant="ghost"
              size="sm"
              loading={pendingUnlink === account.providerId}
              disabled={pendingUnlink !== null}
              onClick={() => handleUnlink(account.providerId)}
            >
              Unlink
            </Button>
          )}
        </div>
      ))}

      <div className="flex flex-col gap-2 rounded-xl bg-muted p-5">
        <p className="text-sm font-medium">Connect another account</p>
        <p className="text-sm text-muted-foreground">Use Google or GitHub sign in.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {linkProviders.map((provider) => {
            const Icon = provider.icon
            const linked = linkedIds.has(provider.id)
            return (
              <Button
                key={provider.id}
                variant="secondary"
                loading={pendingProvider === provider.id}
                disabled={linked || pendingProvider !== null}
                onClick={() => handleLink(provider.id)}
              >
                <Icon className="size-4" weight="bold" />
                {linked ? `${provider.label} linked` : provider.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { LinkedAccountsPanel }
