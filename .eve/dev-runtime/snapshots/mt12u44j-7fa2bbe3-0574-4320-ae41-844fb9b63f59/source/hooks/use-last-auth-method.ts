"use client"

import { useSyncExternalStore } from "react"

import {
  getLastUsedLoginMethod,
  subscribeLastUsedLoginMethod,
} from "@/lib/api/client"

function useLastAuthMethod() {
  return useSyncExternalStore(
    subscribeLastUsedLoginMethod,
    getLastUsedLoginMethod,
    () => null
  )
}

export { useLastAuthMethod }
