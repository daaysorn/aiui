"use client"

import { useActionState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  createOrganisationAction,
  type CreateOrganisationState,
} from "@/app/(dashboard)/dashboard/organisations/new/actions"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queryKeys } from "@/lib/query/keys"

export function NewOrganisationView() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [state, formAction, pending] = useActionState<
    CreateOrganisationState | null,
    FormData
  >(createOrganisationAction, null)

  useEffect(() => {
    if (!state?.slug) return
    void queryClient.invalidateQueries({ queryKey: queryKeys.overview })
    router.push(`/dashboard/organisations/${state.slug}`)
    router.refresh()
  }, [queryClient, router, state?.slug])

  return (
    <DashboardSection
      title="New organisation"
      description="Name the new organisation."
    >
      <form
        action={formAction}
        className="max-w-xl flex flex-col gap-4 rounded-xl bg-card p-6"
      >
        {state?.error ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Organisation name
          </label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <Button type="submit" loading={pending}>
          Create organisation
        </Button>
      </form>
    </DashboardSection>
  )
}
