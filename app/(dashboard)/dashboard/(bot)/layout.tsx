"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { chatSuggestionsEnabled } from "@/lib/env"
import { OverviewView } from "@/views/dashboard/overviewView"

function threadIdFromPath(pathname: string): string | null {
  const match = /^\/dashboard\/chat\/([^/]+)$/.exec(pathname)
  return match?.[1] ?? null
}

export default function BotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const threadId = threadIdFromPath(pathname)

  useEffect(() => {
    const legacy = searchParams.get("thread")
    if (pathname === "/dashboard" && legacy) {
      router.replace(`/dashboard/chat/${legacy}`)
    }
  }, [pathname, router, searchParams])

  return (
    <>
      <OverviewView
        threadId={threadId}
        showSuggestions={chatSuggestionsEnabled()}
      />
      {children}
    </>
  )
}
