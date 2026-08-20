"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Input } from "@/components/ui/input"
import { useRecentChats } from "@/hooks/use-dashboard-query"

export function SearchView() {
  const { data: recents, isPending } = useRecentChats()
  const [query, setQuery] = useState("")

  const matches = useMemo(() => {
    const value = query.trim().toLowerCase()
    const items = recents ?? []
    if (!value) return items
    return items.filter(
      (chat) =>
        chat.title.toLowerCase().includes(value) ||
        chat.projectName.toLowerCase().includes(value)
    )
  }, [query, recents])

  if (isPending) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardSection title="Search chat" description="Find a past chat.">
      <div className="flex max-w-xl flex-col gap-4">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats"
          autoFocus
        />
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching chats.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {matches.map((chat) => (
              <li key={chat.id}>
                <Link
                  href={`/dashboard/projects/${chat.projectId}`}
                  className="block rounded-xl bg-card px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <p className="truncate font-medium">{chat.title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {chat.projectName}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardSection>
  )
}
