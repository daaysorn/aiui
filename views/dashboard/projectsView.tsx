import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/api/types"

export function ProjectsView({ projects }: { projects: Project[] }) {
  return (
    <DashboardSection
      title="Projects"
      description="Each project is a site notebook with instructions, skills, and chat threads."
      action={
        <Button render={<Link href="/dashboard/projects/new" />}>
          New project
        </Button>
      }
    >
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
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
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40"
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
