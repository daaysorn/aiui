const DEFAULT_API_BASE_URL = "http://localhost:3000"
const AUTH_BASE_PATH = "/v1/auth"

export function getApiBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    DEFAULT_API_BASE_URL

  return url.replace(/\/$/, "")
}

export function getAuthBasePath() {
  return AUTH_BASE_PATH
}

export function getAuthBaseUrl() {
  return `${getApiBaseUrl()}${AUTH_BASE_PATH}`
}

/** Public auth paths Nest exposes (see builderbackend auth-public-paths). */
export function getAuthPublicPath(suffix: string) {
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`
  return `${AUTH_BASE_PATH}${normalized}`
}

/**
 * Better Auth client emits hyphen paths (`/sign-in/email`).
 * Nest accepts those directly; public aliases use slashes without hyphens
 * (`/signin/email`) and are rewritten server-side.
 */
export function rewriteAuthRequestUrl(input: string | URL | Request) {
  const href =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url

  const url = new URL(href)

  if (url.pathname === `${AUTH_BASE_PATH}/get-session`) {
    url.pathname = "/v1/user/me"
  }

  return url
}
