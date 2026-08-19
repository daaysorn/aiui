const STORAGE_KEY = "aiui:pending-verify-email"

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function setPendingVerifyEmail(email: string) {
  if (typeof window === "undefined") return

  const normalized = normalizeEmail(email)
  if (!normalized) return

  localStorage.setItem(STORAGE_KEY, normalized)
}

function getPendingVerifyEmail() {
  if (typeof window === "undefined") return null

  const value = localStorage.getItem(STORAGE_KEY)?.trim() ?? ""
  return value || null
}

function clearPendingVerifyEmail() {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEY)
}

export {
  clearPendingVerifyEmail,
  getPendingVerifyEmail,
  setPendingVerifyEmail,
}
