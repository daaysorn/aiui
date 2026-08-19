"use client"

import { useEffect, useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { GithubLogoIcon, GoogleLogoIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  startLinkAccountAction,
  unlinkAccountAction,
} from "@/app/(dashboard)/dashboard/settings/actions"
import {
  SettingsCard,
  SettingsEmpty,
  SettingsLoading,
  SettingsPanel,
  SettingsRow,
} from "@/components/dashboard/settings-ui"
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

function providerIcon(providerId: string) {
  if (providerId === "google") return GoogleLogoIcon
  if (providerId === "github") return GithubLogoIcon
  return null
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
    <SettingsPanel>
      {isLoading ? <SettingsLoading label="Loading linked accounts…" /> : null}

      {!isLoading && accounts.length === 0 ? (
        <SettingsEmpty label="No linked accounts yet." />
      ) : null}

      {!isLoading && accounts.length > 0 ? (
        <SettingsCard title="Connected" description="Sign-in methods on your account.">
          <div className="flex flex-col gap-2">
            {accounts.map((account) => {
              const Icon = providerIcon(account.providerId)
              return (
                <SettingsRow
                  key={account.id}
                  leading={
                    Icon ? <Icon className="size-4" weight="bold" /> : undefined
                  }
                  title={providerLabel(account.providerId)}
                  description={`Connected ${new Date(account.createdAt).toLocaleDateString()}`}
                  action={
                    account.providerId === "credential" ? null : (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={pendingUnlink === account.providerId}
                        disabled={pendingUnlink !== null}
                        onClick={() => handleUnlink(account.providerId)}
                      >
                        Unlink
                      </Button>
                    )
                  }
                />
              )
            })}
          </div>
        </SettingsCard>
      ) : null}

      <SettingsCard title="Add provider" description="Use Google or GitHub sign in.">
        <div className="flex flex-wrap gap-2">
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
      </SettingsCard>
    </SettingsPanel>
  )
}

export { LinkedAccountsPanel }
