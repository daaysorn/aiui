"use client"

import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/hooks/use-dashboard-query"

export function ProjectsView() {
  const { data: projects, isPending } = useProjects()

  if (isPending || !projects) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardSection
      title="Projects"
      description="Your saved site projects."
      action={
        <Button render={<Link href="/dashboard/projects/new" />}>
          New project
        </Button>
      }
    >
      {projects.length === 0 ? (
        <div className="rounded-xl bg-muted p-8 text-center">
          <p className="text-sm text-muted-foreground">No projects yet.</p>
          <Button className="mt-4" render={<Link href="/dashboard/projects/new" />}>
            Create your first project
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block rounded-xl bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{project.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {project.brief ?? "No brief yet."}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {project.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  )
}
