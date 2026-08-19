import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { isApiEnvelope } from "@/lib/api/envelope"
import { getPublicSiteUrl } from "@/lib/env"

const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/error",
] as const

const protectedPrefixes = ["/dashboard", "/onboarding"] as const

async function readSession(request: NextRequest) {
  const response = await fetch(`${getPublicSiteUrl()}/v1/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const payload: unknown = await response.json()
  if (isApiEnvelope(payload)) {
    if (payload.statusCode >= 400 || !payload.data) {
      return null
    }
    return payload.data as {
      user?: {
        emailVerified?: boolean
        username?: string | null
        telephone?: string | null
      } | null
    }
  }

  return payload as {
    user?: {
      emailVerified?: boolean
      username?: string | null
      telephone?: string | null
    } | null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await readSession(request)
  const isAuthenticated = Boolean(session?.user)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuthenticated && isProtected) {
    const signInUrl = new URL("/auth/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (
    isAuthenticated &&
    session?.user &&
    !session.user.emailVerified &&
    !pathname.startsWith("/auth/verify-email")
  ) {
    return NextResponse.redirect(new URL("/auth/verify-email", request.url))
  }

  if (
    isAuthenticated &&
    session?.user?.emailVerified &&
    pathname.startsWith("/dashboard") &&
    (!session.user.username || !session.user.telephone)
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/auth/:path*"],
}
