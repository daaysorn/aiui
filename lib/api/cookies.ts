export const AIUI_ACCESS_COOKIE = "aiui_access_token"
export const AIUI_REFRESH_COOKIE = "aiui_refresh_token"
export const AIUI_ONBOARDING_SKIPPED_COOKIE = "aiui_onboarding_skipped"

export function aiuiCookieOptions(maxAgeSeconds?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(typeof maxAgeSeconds === "number" ? { maxAge: maxAgeSeconds } : {}),
  }
}
