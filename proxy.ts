import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { AIUI_ACCESS_COOKIE } from "@/lib/api/cookies"
import { siteRoutes, withNextParam } from "@/lib/site"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(AIUI_ACCESS_COOKIE)?.value
  if (!accessToken) {
    const signInUrl = new URL(
      withNextParam(siteRoutes.signIn, pathname),
      request.url
    )
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
