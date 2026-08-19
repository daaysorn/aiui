import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import type { ProjectDetail } from "@/lib/api/types"

export function ProjectDetailView({ project }: { project: ProjectDetail }) {
  return (
    <DashboardSection
      title={project.name}
      description={project.brief ?? "No brief yet."}
      action={
        <Button variant="outline" render={<Link href="/dashboard/projects" />}>
          All projects
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-heading text-base font-semibold">Threads</h2>
          {project.threads.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No chat threads yet. Eve wiring comes next.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {project.threads.map((thread) => (
                <li
                  key={thread.id}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  <p className="font-medium">{thread.title}</p>
                  <p className="text-xs text-muted-foreground">{thread.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <p className="mt-2 font-medium">{project.status}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Slug</p>
            <p className="mt-2 break-all font-mono text-xs">{project.slug}</p>
          </div>
        </div>
      </div>
    </DashboardSection>
  )
}
