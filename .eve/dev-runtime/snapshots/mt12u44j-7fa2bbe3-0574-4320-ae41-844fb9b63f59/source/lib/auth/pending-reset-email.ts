const STORAGE_KEY = "aiui:pending-reset-email"

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function setPendingResetEmail(email: string) {
  if (typeof window === "undefined") return

  const normalized = normalizeEmail(email)
  if (!normalized) return

  localStorage.setItem(STORAGE_KEY, normalized)
}

function getPendingResetEmail() {
  if (typeof window === "undefined") return null

  const value = localStorage.getItem(STORAGE_KEY)?.trim() ?? ""
  return value || null
}

function clearPendingResetEmail() {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEY)
}

export {
  clearPendingResetEmail,
  getPendingResetEmail,
  setPendingResetEmail,
}
