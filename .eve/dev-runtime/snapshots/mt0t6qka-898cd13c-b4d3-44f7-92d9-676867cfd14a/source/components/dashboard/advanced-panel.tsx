"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { SignOutIcon, TrashIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { deleteAccountAction } from "@/app/(dashboard)/dashboard/settings/actions"
import { PasswordInput } from "@/components/auth/password-input"
import { SettingsCard, SettingsPanel } from "@/components/dashboard/settings-ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLinkedAccounts } from "@/hooks/use-dashboard-query"
import { clearSession } from "@/lib/api/client"

function AdvancedPanel() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: accounts = [] } = useLinkedAccounts()
  const [password, setPassword] = useState("")
  const [signingOut, setSigningOut] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, startDelete] = useTransition()

  const needsPassword = accounts.some(
    (account) => account.providerId === "credential"
  )

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

  function handleDeleteAccount() {
    startDelete(async () => {
      const result = await deleteAccountAction(password || undefined)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(result.message ?? "Account deleted.")
      setDeleteOpen(false)
      await queryClient.clear()
      await clearSession()
      router.push("/sign-in")
      router.refresh()
    })
  }

  return (
    <>
      <SettingsPanel>
        <SettingsCard title="Sign out" description="End this dashboard session.">
          <Button
            variant="secondary"
            className="self-start"
            onClick={() => setSignOutOpen(true)}
          >
            <SignOutIcon className="size-4" />
            Sign out
          </Button>
        </SettingsCard>

        <SettingsCard
          tone="danger"
          title="Delete account"
          description="Permanently remove your daaysorn account."
        >
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
            disabled={needsPassword && password.length < 8}
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon className="size-4" />
            Delete account
          </Button>
        </SettingsCard>
      </SettingsPanel>

      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">
              Sign out?
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
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-destructive">
              Delete your account?
            </DialogTitle>
            <DialogDescription>
              This permanently removes your daaysorn account. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleting}
              onClick={handleDeleteAccount}
            >
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { AdvancedPanel }
