const OTP_RESEND_COOLDOWN_MS = 60_000

function storageKey(email: string) {
  return `aiui:otp-resend:${email.trim().toLowerCase()}`
}

function getOtpResendAvailableAt(email: string): number | null {
  if (typeof window === "undefined") return null

  const raw = sessionStorage.getItem(storageKey(email))
  if (!raw) return null

  const availableAt = Number(raw)
  if (!Number.isFinite(availableAt) || availableAt <= Date.now()) {
    sessionStorage.removeItem(storageKey(email))
    return null
  }

  return availableAt
}

function setOtpResendCooldown(email: string): number {
  const availableAt = Date.now() + OTP_RESEND_COOLDOWN_MS
  sessionStorage.setItem(storageKey(email), String(availableAt))
  return availableAt
}

function clearOtpResendCooldown(email: string) {
  sessionStorage.removeItem(storageKey(email))
}

export {
  OTP_RESEND_COOLDOWN_MS,
  clearOtpResendCooldown,
  getOtpResendAvailableAt,
  setOtpResendCooldown,
}
