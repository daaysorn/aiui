"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { useUserOverview } from "@/hooks/use-dashboard-query"
import { isFreePlan, planSlug } from "@/lib/billing"
import { queryKeys } from "@/lib/query/keys"

const POLL_INTERVAL_MS = 2_000
const MAX_POLL_ATTEMPTS = 15

function cleanCheckoutParams(
  router: ReturnType<typeof useRouter>,
  settings: string | null,
) {
  if (settings) {
    router.replace(`/dashboard?settings=${settings}`)
    return
  }
  router.replace("/dashboard")
}

export function useBillingCheckoutReturn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { refetch } = useUserOverview()
  const handledRef = useRef(false)

  useEffect(() => {
    const checkout = searchParams.get("checkout")
    if (!checkout || handledRef.current) {
      return
    }

    handledRef.current = true
    const settings = searchParams.get("settings")
    const initialPlanSlug = planSlug(
      queryClient.getQueryData<{ billing?: { plan?: { slug?: string } | null } }>(
        queryKeys.overview,
      )?.billing?.plan ?? "free",
    )

    if (checkout === "cancelled") {
      toast.message("Checkout cancelled.")
      cleanCheckoutParams(router, settings)
      return
    }

    if (checkout !== "success") {
      return
    }

    let attempts = 0
    let cancelled = false
    let timeoutId: number | undefined

    async function pollForUpgrade() {
      attempts += 1
      await queryClient.invalidateQueries({ queryKey: queryKeys.overview })
      const result = await refetch()
      const overview = result.data
      const nextPlan = overview?.billing.plan ?? null
      const upgraded =
        (nextPlan && !isFreePlan(nextPlan)) ||
        planSlug(nextPlan) !== initialPlanSlug

      if (upgraded && nextPlan) {
        toast.success(`You're on ${nextPlan.name}.`)
        router.refresh()
        cleanCheckoutParams(router, settings)
        return
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        toast.success("Payment received. Refresh if your plan looks unchanged.")
        router.refresh()
        cleanCheckoutParams(router, settings)
        return
      }

      if (!cancelled) {
        timeoutId = window.setTimeout(() => {
          void pollForUpgrade()
        }, POLL_INTERVAL_MS)
      }
    }

    void pollForUpgrade()

    return () => {
      cancelled = true
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [queryClient, refetch, router, searchParams])
}
