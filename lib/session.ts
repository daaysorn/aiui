import { headers } from "next/headers"

import { isApiEnvelope } from "@/lib/api/envelope"
import { getPublicSiteUrl } from "@/lib/env"

type SessionPayload = {
  session: {
    id: string
    userId: string
    expiresAt: string
  } | null
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    username: string | null
    telephone: string | null
    image: string | null
  } | null
}

export async function getServerSession(): Promise<SessionPayload | null> {
  const headerStore = await headers()
  const cookie = headerStore.get("cookie") ?? ""
  if (!cookie) {
    return null
  }

  const response = await fetch(`${getPublicSiteUrl()}/v1/auth/get-session`, {
    headers: { cookie },
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
    return payload.data as SessionPayload
  }

  return payload as SessionPayload
}

export function needsOnboarding(user: SessionPayload["user"]): boolean {
  if (!user) {
    return false
  }
  return !user.username || !user.telephone
}
