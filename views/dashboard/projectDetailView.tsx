"use client"

import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { useProject } from "@/hooks/use-dashboard-query"

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { data: project, isPending } = useProject(projectId)

  if (isPending) {
    return <DashboardSkeleton />
  }

  if (!project) {
    return (
      <DashboardSection
        title="Project not found"
        description="It may have been removed."
        action={
          <Button variant="secondary" render={<Link href="/dashboard/projects" />}>
            All projects
          </Button>
        }
      />
    )
  }

  return (
    <DashboardSection
      title={project.name}
      description={project.brief ?? "No brief yet."}
      action={
        <Button variant="secondary" render={<Link href="/dashboard/projects" />}>
          All projects
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl bg-card p-4">
          <h2 className="font-heading text-base font-semibold">Threads</h2>
          {project.threads.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No chat threads yet. Eve wiring comes next.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {project.threads.map((thread) => (
                <li
                  key={thread.id}
                  className="rounded-md bg-muted px-3 py-2 text-sm"
                >
                  <p className="font-medium">{thread.title}</p>
                  <p className="text-xs text-muted-foreground">{thread.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-card p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <p className="mt-2 font-medium">{project.status}</p>
          </div>
          <div className="rounded-xl bg-card p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Slug</p>
            <p className="mt-2 min-w-0 break-all font-mono text-xs">{project.slug}</p>
          </div>
        </div>
      </div>
    </DashboardSection>
  )
}
