"use client"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { useCatalog } from "@/hooks/use-dashboard-query"
import type { CatalogKind } from "@/lib/api/types"

const copy: Record<
  Exclude<CatalogKind, "skill">,
  { title: string; description: string; empty: string }
> = {
  plugin: {
    title: "Plugins",
    description: "Browse available plugins.",
    empty: "No plugins in the catalog.",
  },
  mcp: {
    title: "MCPs",
    description: "Browse available MCPs.",
    empty: "No MCPs in the catalog.",
  },
}

export function CatalogView({ kind }: { kind: Exclude<CatalogKind, "skill"> }) {
  const { data: items, isPending } = useCatalog(kind)
  const { title, description, empty } = copy[kind]

  if (isPending || !items) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardSection title={title} description={description}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="grid max-w-xl gap-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl bg-card px-4 py-3">
              <p className="font-medium">{item.name ?? item.slug}</p>
              {item.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  )
}
