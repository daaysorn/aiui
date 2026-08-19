"use client"

import { useQuery } from "@tanstack/react-query"

import {
  fetchBillingPlans,
  fetchProject,
  fetchProjects,
  fetchUserOverview,
} from "@/lib/api/dashboard-data"
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
