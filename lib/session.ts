import { cookies } from "next/headers"

import { AIUI_ACCESS_COOKIE } from "@/lib/api/cookies"
import { apiRequestOrThrow } from "@/lib/api/fetch"
import type { SessionUser } from "@/lib/api/types"

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AIUI_ACCESS_COOKIE)?.value ?? null
}

export async function getServerUser(): Promise<SessionUser | null> {
  const token = await getAccessToken()
  if (!token) {
    return null
  }

  try {
    const user = await apiRequestOrThrow<{ user: SessionUser }>("/v1/user/me", {
      token,
    })
    return user.user ?? null
  } catch {
    return null
  }
}

export function needsOnboarding(user: SessionUser | null): boolean {
  if (!user) {
    return false
  }
  return !user.username || !user.telephone
}
