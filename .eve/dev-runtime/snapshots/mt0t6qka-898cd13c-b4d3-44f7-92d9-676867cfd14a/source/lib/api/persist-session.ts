import { authClient } from "@/lib/api/auth-client"
import { getAuthPublicPath } from "@/lib/api/config"
import { apiRequest } from "@/lib/api/fetch"

type ResolvedTokens = {
  token: string
  refreshToken?: string
}

/** Persist Nest bearer tokens as aiui httpOnly cookies (BFF). */
export async function persistSession(input: {
  token: string
  refreshToken?: string | null
}) {
  const response = await fetch("/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: input.token,
      refreshToken: input.refreshToken || undefined,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to store session.")
  }

  return response
}

export async function clearSession() {
  await fetch("/auth/session", { method: "DELETE" })
}

export function stripOAuthTokensFromCurrentUrl() {
  if (typeof window === "undefined") {
    return
  }

  const url = new URL(window.location.href)
  let changed = false
  for (const key of ["code", "token", "refreshToken", "access_token", "refresh_token"]) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (changed) {
    window.history.replaceState({}, "", `${url.pathname}${url.search}`)
  }
}

async function exchangeOAuthCode(code: string) {
  return apiRequest<{ token?: string; refreshToken?: string }>(
    getAuthPublicPath("/session/oauth/exchange"),
    {
      method: "POST",
      json: { code },
    }
  )
}

/** Resolve tokens after OAuth returns to /callback. */
export async function resolveSessionTokens(
  params: URLSearchParams
): Promise<ResolvedTokens | null> {
  const inlineToken = params.get("token")?.trim()
  if (inlineToken) {
    return {
      token: inlineToken,
      ...(params.get("refreshToken")?.trim()
        ? { refreshToken: params.get("refreshToken")!.trim() }
        : {}),
    }
  }

  const code = params.get("code")?.trim()
  if (code) {
    const exchanged = await exchangeOAuthCode(code)
    const token = exchanged.envelope.data?.token
    if (!exchanged.ok || !token) {
      return null
    }
    return {
      token,
      ...(exchanged.envelope.data?.refreshToken
        ? { refreshToken: exchanged.envelope.data.refreshToken }
        : {}),
    }
  }

  const session = await authClient.getSession()
  const data = session.data as
    | { session?: { token?: string }; token?: string }
    | null
    | undefined

  const token = data?.session?.token ?? data?.token
  if (!token) {
    return null
  }

  return { token }
}
