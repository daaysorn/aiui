"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { DASHBOARD_SEARCH_CHATS_EVENT } from "@/lib/chat/thread-title"

/** Legacy /dashboard/search → open the command palette on the main chat. */
export default function SearchPage() {
  const router = useRouter()

  useEffect(() => {
    window.dispatchEvent(new Event(DASHBOARD_SEARCH_CHATS_EVENT))
    router.replace("/dashboard", { scroll: false })
  }, [router])

  return null
}
