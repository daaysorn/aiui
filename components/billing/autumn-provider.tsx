"use client"

import { AutumnProvider } from "autumn-js/react"
import type { ReactNode } from "react"

type BillingAutumnProviderProps = {
  children: ReactNode
}

/** Same-origin Autumn handler at `/api/autumn` (server uses AUTUMN_SECRET_KEY). */
export function BillingAutumnProvider({ children }: BillingAutumnProviderProps) {
  return <AutumnProvider>{children}</AutumnProvider>
}
