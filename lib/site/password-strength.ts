export type PasswordStrength = "empty" | "weak" | "medium" | "strong"

export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) {
    return "empty"
  }

  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1

  if (score <= 2) return "weak"
  if (score <= 4) return "medium"
  return "strong"
}

export function getPasswordStrengthBars(strength: PasswordStrength) {
  switch (strength) {
    case "weak":
      return 1
    case "medium":
      return 2
    case "strong":
      return 3
    default:
      return 0
  }
}
