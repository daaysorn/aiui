const DEFAULT_API_URL = "http://localhost:3000"
const DEFAULT_SITE_URL = "http://localhost:3001"

export function getApiUrl(): string {
  return process.env.API_URL?.trim() || DEFAULT_API_URL
}

export function getPublicSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL
}

/** Browser and auth client hit same-origin `/v1` via Next rewrites. */
export function getAuthBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return getPublicSiteUrl()
}
