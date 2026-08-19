export const siteRoutes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  callback: "/callback",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  verifyEmail: "/verify-email",
} as const

export const siteLinks = {
  terms: process.env.NEXT_PUBLIC_TERMS_URL ?? "/terms",
  privacy: process.env.NEXT_PUBLIC_PRIVACY_URL ?? "/privacy",
} as const

/** Cloudflare always-pass visible test sitekey (localhost). */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA"

function isBrowserLocalhost() {
  if (typeof window === "undefined") {
    return false
  }

  const hostname = window.location.hostname
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  )
}

/** Localhost always uses the Cloudflare test widget. Production uses the env sitekey. */
export function getTurnstileSiteKey() {
  if (isBrowserLocalhost()) {
    return TURNSTILE_TEST_SITE_KEY
  }

  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || TURNSTILE_TEST_SITE_KEY
}
