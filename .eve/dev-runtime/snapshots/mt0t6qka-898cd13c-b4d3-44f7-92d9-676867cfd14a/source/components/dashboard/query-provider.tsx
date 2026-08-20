"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"

import type { UserOverview } from "@/lib/api/types"
import { createDashboardQueryClient } from "@/lib/query/client"
import { queryKeys } from "@/lib/query/keys"

export function DashboardQueryProvider({
  overview,
  children,
}: {
  overview: UserOverview
  children: ReactNode
}) {
  const [queryClient] = useState(() => {
    const client = createDashboardQueryClient()
    client.setQueryData(queryKeys.overview, overview)
    return client
  })

  useEffect(() => {
    queryClient.setQueryData(queryKeys.overview, overview)
  }, [overview, queryClient])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
