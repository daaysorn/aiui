"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  consumePendingAuthMethod,
  persistSession,
  resolveSessionTokens,
  stripOAuthTokensFromCurrentUrl,
  syncLastUsedLoginMethodCookie,
} from "@/lib/api/client"
import {
  buildSocialAuthErrorPath,
  getSafeNextPath,
  parseAuthMethod,
  resolveSocialAuthErrorMessage,
  siteRoutes,
} from "@/lib/site"

function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const started = useRef(false)
  const [message, setMessage] = useState("Finishing sign in...")

  useEffect(() => {
    if (started.current) return
    started.current = true

    const error =
      searchParams.get("error") ?? searchParams.get("error_description")

    if (error) {
      router.replace(buildSocialAuthErrorPath(siteRoutes.signIn, searchParams))
      return
    }

    const next = getSafeNextPath(searchParams.get("next"))

    void (async () => {
      try {
        const tokens = await resolveSessionTokens(searchParams)
        stripOAuthTokensFromCurrentUrl()

        if (!tokens?.token) {
          setMessage("Could not finish sign in.")
          toast.error(resolveSocialAuthErrorMessage(searchParams))
          router.replace(`${siteRoutes.signIn}?error=missing_token`)
          return
        }

        await persistSession(tokens)

        const method =
          parseAuthMethod(searchParams.get("method")) ??
          parseAuthMethod(consumePendingAuthMethod())

        if (method) {
          syncLastUsedLoginMethodCookie(method)
        }

        toast.success("Signed in.")
        router.replace(next)
        router.refresh()
      } catch {
        setMessage("Sign in failed.")
        toast.error("Social sign in failed.")
        router.replace(`${siteRoutes.signIn}?error=social`)
      }
    })()
  }, [router, searchParams])

  return (
    <p className="sr-only" role="status">
      {message}
    </p>
  )
}

export { AuthCallback }
