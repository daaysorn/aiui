import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  AIUI_ACCESS_COOKIE,
  AIUI_ONBOARDING_SKIPPED_COOKIE,
  AIUI_REFRESH_COOKIE,
  aiuiCookieOptions,
} from "@/lib/api/cookies"
import { signOutWithToken } from "@/lib/api/auth"

export async function POST(request: Request) {
  let body: { token?: string; refreshToken?: string }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  if (!body.token) {
    return NextResponse.json({ message: "token is required." }, { status: 400 })
  }

  const response = NextResponse.json({
    message: "Session stored.",
    data: { ok: true },
  })

  const cookieOptions = aiuiCookieOptions()
  response.cookies.set(AIUI_ACCESS_COOKIE, body.token, cookieOptions)

  if (body.refreshToken) {
    response.cookies.set(AIUI_REFRESH_COOKIE, body.refreshToken, cookieOptions)
  }

  return response
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AIUI_ACCESS_COOKIE)?.value
  const origin = request.headers.get("origin") ?? new URL(request.url).origin

  if (token) {
    try {
      await signOutWithToken({ token, origin })
    } catch {
      // Still clear local cookies if upstream sign-out fails.
    }
  }

  const response = NextResponse.json({
    message: "Session cleared.",
    data: { ok: true },
  })

  response.cookies.set(AIUI_ACCESS_COOKIE, "", { ...aiuiCookieOptions(0), maxAge: 0 })
  response.cookies.set(AIUI_REFRESH_COOKIE, "", { ...aiuiCookieOptions(0), maxAge: 0 })
  response.cookies.set(AIUI_ONBOARDING_SKIPPED_COOKIE, "", {
    ...aiuiCookieOptions(0),
    maxAge: 0,
  })

  return response
}
