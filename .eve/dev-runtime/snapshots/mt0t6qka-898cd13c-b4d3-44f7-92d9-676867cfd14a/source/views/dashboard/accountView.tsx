"use client"

import { useActionState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  updateProfileAction,
  type SettingsState,
} from "@/app/(dashboard)/dashboard/settings/actions"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserOverview } from "@/hooks/use-dashboard-query"
import { queryKeys } from "@/lib/query/keys"

export function AccountView() {
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

  if (!user) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardSection title="Account" description="Update your profile details.">
      <form
        action={formAction}
        className="flex max-w-xl flex-col gap-4 rounded-xl bg-card p-6"
      >
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
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" value={user.email} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            defaultValue={user.username ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="telephone" className="text-sm font-medium">
            Phone
          </label>
          <Input
            id="telephone"
            name="telephone"
            defaultValue={user.telephone ?? ""}
          />
        </div>
        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </form>
    </DashboardSection>
  )
}
