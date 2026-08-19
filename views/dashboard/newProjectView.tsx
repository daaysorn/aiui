"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { AuthField, AuthMessage } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createProject } from "@/lib/api/projects"

export function NewProjectView() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [brief, setBrief] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const project = await createProject({
        name,
        brief: brief.trim() || undefined,
      })
      router.push(`/dashboard/projects/${project.id}`)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create project")
      setPending(false)
    }
  }

  return (
    <DashboardSection
      title="New project"
      description="Give the site a name and a short brief. You can add instructions and skills later."
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6"
      >
        {error ? <AuthMessage>{error}</AuthMessage> : null}
        <AuthField label="Project name" htmlFor="name">
          <Input
            id="name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </AuthField>
        <AuthField label="Brief" htmlFor="brief" hint="Optional. One or two sentences about the site.">
          <textarea
            id="brief"
            rows={4}
            maxLength={8000}
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            className="flex min-h-24 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </AuthField>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create project"}
        </Button>
      </form>
    </DashboardSection>
  )
}
