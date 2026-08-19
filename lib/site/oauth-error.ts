export function getOAuthErrorCodes(searchParams: URLSearchParams): string[] {
  const fromError = searchParams.getAll("error").map((value) => value.trim())
  const description = searchParams.get("error_description")?.trim()
  return [...fromError, ...(description ? [description] : [])].filter(Boolean)
}

export function resolveSocialAuthErrorMessage(
  searchParams: URLSearchParams,
  fallback = "Social sign in failed. Try email instead."
): string {
  const codes = getOAuthErrorCodes(searchParams)
  const normalized = codes.join(" ").toLowerCase()

  if (
    normalized.includes("access_denied") ||
    normalized.includes("cancel")
  ) {
    return "Sign in was cancelled."
  }

  if (
    normalized.includes("account_not_linked") ||
    normalized.includes("account not linked")
  ) {
    return "That social account is already linked to another user."
  }

  if (normalized.includes("state")) {
    return "Sign in expired. Please try again."
  }

  if (
    normalized.includes("missing_token") ||
    normalized.includes("missing token")
  ) {
    return "Social sign in could not finish. Try again."
  }

  if (
    normalized.includes("invalid_code") ||
    normalized.includes("invalid_token")
  ) {
    return "Social sign in failed. Start again from the sign-in page."
  }

  if (
    normalized.includes("email_not_verified") ||
    normalized.includes("email not verified")
  ) {
    return "Verify your email before using social sign in."
  }

  if (normalized.includes("signup_disabled") || normalized.includes("sign_up_disabled")) {
    return "Social sign up is not available. Use email instead."
  }

  if (codes.length > 0) {
    return fallback
  }

  return fallback
}

export function buildSocialAuthErrorPath(
  path: string,
  searchParams: URLSearchParams
): string {
  const codes = getOAuthErrorCodes(searchParams)
  const preferred = codes[codes.length - 1] ?? "social"
  const url = new URL(path, "http://local.invalid")
  url.searchParams.set("error", preferred.replace(/\s+/g, "_"))
  return `${url.pathname}${url.search}`
}
