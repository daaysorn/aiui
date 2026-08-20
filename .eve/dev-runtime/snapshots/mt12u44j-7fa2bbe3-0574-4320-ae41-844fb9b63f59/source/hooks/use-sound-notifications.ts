"use client"

import { useSyncExternalStore } from "react"

import {
  isSoundNotificationsEnabled,
  subscribeSoundNotifications,
} from "@/lib/sound-notifications"

function useSoundNotifications() {
  return useSyncExternalStore(
    subscribeSoundNotifications,
    isSoundNotificationsEnabled,
    () => true
  )
}

export { useSoundNotifications }
