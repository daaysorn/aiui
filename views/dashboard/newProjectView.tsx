"use client"

import { useActionState } from "react"

import {
  createProjectAction,
  type CreateProjectState,
} from "@/app/(dashboard)/dashboard/projects/new/actions"
import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewProjectView() {
  const [state, formAction, pending] = useActionState<
    CreateProjectState | null,
    FormData
  >(createProjectAction, null)

  return (
    <DashboardSection
      title="New project"
      description="Give the site a name and a short brief. You can add instructions and skills later."
    >
      <form
        action={formAction}
        className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6"
      >
        {state?.error ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Project name
          </label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <div className="space-y-2">
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
            className="flex min-h-24 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create project"}
        </Button>
      </form>
    </DashboardSection>
  )
}
