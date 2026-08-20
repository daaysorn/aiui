"use client"

import { useCustomer } from "autumn-js/react"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import {
  checkFeatureAccessAction,
  trackFeatureUsageAction,
} from "@/app/(dashboard)/dashboard/billing/actions"
import {
  AUTUMN_CREDITS_FEATURE_ID,
  CHAT_MESSAGE_CREDIT_COST,
} from "@/lib/billing/features"
import { queryKeys } from "@/lib/query/keys"
import { useUserOverview } from "@/hooks/use-dashboard-query"

type GateInput = {
  featureId?: string
  requiredBalance?: number
}

type TrackInput = {
  featureId?: string
  value?: number
}

/**
 * Client-side Autumn check (UX) plus server check/track via Nest billing routes.
 * Pattern: check -> do work -> track (track only after success).
 */
export function useBillingGate() {
  const { check, refetch, isLoading: customerLoading, data: customer } = useCustomer()
  const { data: overview } = useUserOverview()
  const queryClient = useQueryClient()

  const localAllowed = useCallback(
    (input: GateInput) => {
      const featureId = input.featureId ?? AUTUMN_CREDITS_FEATURE_ID
      const requiredBalance = input.requiredBalance ?? CHAT_MESSAGE_CREDIT_COST

      if (customer) {
        return check({ featureId, requiredBalance }).allowed
      }

      const balance = overview?.billing.credits.balance ?? 0
      return balance >= requiredBalance
    },
    [check, customer, overview?.billing.credits.balance]
  )

  const ensureAccess = useCallback(
    async (input: GateInput = {}) => {
      if (!localAllowed(input)) {
        return false
      }

      const result = await checkFeatureAccessAction({
        featureId: input.featureId ?? AUTUMN_CREDITS_FEATURE_ID,
        requiredBalance: input.requiredBalance ?? CHAT_MESSAGE_CREDIT_COST,
      })

      return result.allowed
    },
    [localAllowed]
  )

  const recordUsage = useCallback(
    async (input: TrackInput = {}) => {
      const result = await trackFeatureUsageAction({
        featureId: input.featureId ?? AUTUMN_CREDITS_FEATURE_ID,
        value: input.value ?? CHAT_MESSAGE_CREDIT_COST,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      await refetch()
      await queryClient.invalidateQueries({ queryKey: queryKeys.overview })
    },
    [queryClient, refetch]
  )

  return {
    ensureAccess,
    localAllowed,
    recordUsage,
    refetchCustomer: refetch,
    isLoading: customerLoading,
  }
}
