import { siteRoutes } from "@/lib/site/config"

export type AuthMethod = "email" | "google" | "github"

export function getSafeNextPath(value: string | null | undefined): string {
  if (!value) {
    return siteRoutes.dashboard
  }

  const trimmed = value.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return siteRoutes.dashboard
  }

  return trimmed
}

export function withNextParam(pathname: string, next: string | null | undefined) {
  const safeNext = getSafeNextPath(next)
  if (safeNext === siteRoutes.dashboard && pathname !== siteRoutes.signIn) {
    return pathname
  }

  const url = new URL(pathname, "http://local.invalid")
  url.searchParams.set("next", safeNext)
  return `${url.pathname}${url.search}`
}

export function buildAuthCallbackURL(input: {
  origin: string
  next?: string | null
  method: Exclude<AuthMethod, "email">
}) {
  const callbackPath = withNextParam(
    siteRoutes.callback,
    getSafeNextPath(input.next)
  )
  const url = new URL(callbackPath, input.origin)
  url.searchParams.set("method", input.method)
  return url.toString()
}

export function parseAuthMethod(value: string | null): AuthMethod | null {
  if (value === "google" || value === "github" || value === "email") {
    return value
  }
  return null
}
