import type { AuthFn } from "eve/channels/auth"

const ACCESS_COOKIE = "aiui_access_token"

function readCookie(header: string | null, name: string): string | null {
  if (!header) {
    return null
  }

  for (const part of header.split(";")) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(`${name}=`)) {
      continue
    }
    const value = trimmed.slice(name.length + 1).trim()
    return value ? decodeURIComponent(value) : null
  }

  return null
}

function resolveApiOrigin(): string | null {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  return raw.replace(/\/$/, "") || null
}

type MeEnvelope = {
  data?: { user?: { id?: string; email?: string; name?: string } }
  user?: { id?: string; email?: string; name?: string }
}

/**
 * Validates the httpOnly Daaybot session cookie against Nest `/v1/user/me`.
 * Browser requests to same-origin `/eve/v1/*` send the cookie automatically.
 */
export const daaybotSessionAuth: AuthFn<Request> = async (request) => {
  const token = readCookie(request.headers.get("cookie"), ACCESS_COOKIE)
  if (!token) {
    return null
  }

  const apiOrigin = resolveApiOrigin()
  if (!apiOrigin) {
    return null
  }

  try {
    const response = await fetch(`${apiOrigin}/v1/user/me`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const body = (await response.json()) as MeEnvelope
    const user = body.data?.user ?? body.user
    const userId = user?.id?.trim()
    if (!userId) {
      return null
    }

    const attributes: Record<string, string> = {}
    if (user.email?.trim()) {
      attributes.email = user.email.trim()
    }
    if (user.name?.trim()) {
      attributes.name = user.name.trim()
    }

    return {
      authenticator: "daaybot",
      principalType: "user",
      principalId: userId,
      attributes,
    }
  } catch {
    return null
  }
}
