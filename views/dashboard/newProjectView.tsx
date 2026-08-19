"use client"

import { useActionState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  createProjectAction,
  type CreateProjectState,
} from "@/app/(dashboard)/dashboard/projects/new/actions"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queryKeys } from "@/lib/query/keys"

export function NewProjectView() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [state, formAction, pending] = useActionState<
    CreateProjectState | null,
    FormData
  >(createProjectAction, null)

  useEffect(() => {
    if (!state?.id) return
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    router.push(`/dashboard/projects/${state.id}`)
  }, [queryClient, router, state?.id])

  return (
    <DashboardSection
      title="New project"
      description="Give the site a name and a short brief. You can add instructions and skills later."
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
            Project name
          </label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="brief" className="text-sm font-medium">
            Brief
          </label>
          <p className="text-xs text-muted-foreground">
            Optional. One or two sentences about the site.
          </p>
          <textarea
            id="brief"
            name="brief"
            rows={4}
            maxLength={8000}
            className="flex min-h-24 w-full min-w-0 rounded-md bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </div>
        <Button type="submit" loading={pending}>
          Create project
        </Button>
      </form>
    </DashboardSection>
  )
}
