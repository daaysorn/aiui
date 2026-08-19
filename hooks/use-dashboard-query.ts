"use client"

import { useQuery } from "@tanstack/react-query"

import {
  fetchBillingPlans,
  fetchCatalog,
  fetchLinkedAccounts,
  fetchProject,
  fetchProjects,
  fetchRecentChats,
  fetchSessions,
  fetchUserOverview,
} from "@/lib/api/dashboard-data"
import { getLocalChannel, listLocalChannels } from "@/lib/channels-store"
import type { CatalogKind } from "@/lib/api/types"
import { queryKeys } from "@/lib/query/keys"

export function useUserOverview() {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: fetchUserOverview,
  })
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  })
}

export function useBillingPlans(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billingPlans,
    queryFn: fetchBillingPlans,
    enabled,
  })
}

export function useCatalog(kind: CatalogKind) {
  return useQuery({
    queryKey: queryKeys.catalog(kind),
    queryFn: () => fetchCatalog(kind),
  })
}

export function useRecentChats() {
  return useQuery({
    queryKey: queryKeys.recentChats,
    queryFn: fetchRecentChats,
  })
}

export function useLinkedAccounts() {
  return useQuery({
    queryKey: queryKeys.linkedAccounts,
    queryFn: fetchLinkedAccounts,
  })
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: fetchSessions,
  })
}

export function useChannels() {
  return useQuery({
    queryKey: queryKeys.channels,
    queryFn: async () => listLocalChannels(),
  })
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: queryKeys.channel(id),
    queryFn: async () => getLocalChannel(id),
    enabled: Boolean(id),
  })
}
