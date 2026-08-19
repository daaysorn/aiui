"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { SignOutIcon, TrashIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { deleteAccountAction } from "@/app/(dashboard)/dashboard/settings/actions"
import { PasswordInput } from "@/components/auth/password-input"
import { Button } from "@/components/ui/button"
import { useLinkedAccounts } from "@/hooks/use-dashboard-query"
import { clearSession } from "@/lib/api/client"

function AdvancedPanel() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: accounts = [] } = useLinkedAccounts()
  const [password, setPassword] = useState("")
  const [signingOut, setSigningOut] = useState(false)
  const [deleting, startDelete] = useTransition()

  const needsPassword = accounts.some(
    (account) => account.providerId === "credential"
  )

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await clearSession()
      router.push("/sign-in")
      router.refresh()
    } catch {
      toast.error("Could not sign out.")
      setSigningOut(false)
    }
  }

  function handleDeleteAccount() {
    startDelete(async () => {
      const result = await deleteAccountAction(password || undefined)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.message ?? "Account deleted.")
      await queryClient.clear()
      await clearSession()
      router.push("/sign-in")
      router.refresh()
    })
  }

  return (
    <div className="flex max-w-lg flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-xl bg-muted p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium">Sign out</p>
          <p className="text-sm text-muted-foreground">End this dashboard session.</p>
        </div>
        <Button
          variant="secondary"
          className="self-start"
          loading={signingOut}
          onClick={handleSignOut}
        >
          <SignOutIcon className="size-4" />
          Sign out
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-destructive/10 p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium text-destructive">Delete account</p>
          <p className="text-sm text-muted-foreground">
            Permanently remove your daaysorn account.
          </p>
        </div>
        {needsPassword ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="delete-password" className="text-sm font-medium">
              Current password
            </label>
            <PasswordInput
              id="delete-password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        ) : null}
        <Button
          variant="destructive"
          className="self-start"
          loading={deleting}
          disabled={needsPassword && password.length < 8}
          onClick={handleDeleteAccount}
        >
          <TrashIcon className="size-4" />
          Delete account
        </Button>
      </div>
    </div>
  )
}

export { AdvancedPanel }
