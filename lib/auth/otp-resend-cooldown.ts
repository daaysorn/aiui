const OTP_RESEND_COOLDOWN_MS = 60_000
const PASSWORD_RESET_RESEND_KIND = "password-reset"

function storageKey(kind: string, email: string) {
  return `aiui:${kind}-resend:${email.trim().toLowerCase()}`
}

function getResendAvailableAt(kind: string, email: string): number | null {
  if (typeof window === "undefined") return null

  const raw = sessionStorage.getItem(storageKey(kind, email))
  if (!raw) return null

  const availableAt = Number(raw)
  if (!Number.isFinite(availableAt) || availableAt <= Date.now()) {
    sessionStorage.removeItem(storageKey(kind, email))
    return null
  }

  return availableAt
}

function setResendCooldown(
  kind: string,
  email: string,
  cooldownMs = OTP_RESEND_COOLDOWN_MS
): number {
  const availableAt = Date.now() + cooldownMs
  sessionStorage.setItem(storageKey(kind, email), String(availableAt))
  return availableAt
}

function clearResendCooldown(kind: string, email: string) {
  sessionStorage.removeItem(storageKey(kind, email))
}

function getOtpResendAvailableAt(email: string) {
  return getResendAvailableAt("otp", email)
}

function setOtpResendCooldown(email: string) {
  return setResendCooldown("otp", email)
}

function clearOtpResendCooldown(email: string) {
  clearResendCooldown("otp", email)
}

function getPasswordResetResendAvailableAt(email: string) {
  return getResendAvailableAt(PASSWORD_RESET_RESEND_KIND, email)
}

function setPasswordResetResendCooldown(email: string) {
  return setResendCooldown(PASSWORD_RESET_RESEND_KIND, email)
}

export {
  OTP_RESEND_COOLDOWN_MS,
  clearOtpResendCooldown,
  getOtpResendAvailableAt,
  getPasswordResetResendAvailableAt,
  setOtpResendCooldown,
  setPasswordResetResendCooldown,
}
