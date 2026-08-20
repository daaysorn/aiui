import { getAuthPublicPath } from "@/lib/api/config"
import { apiRequest } from "@/lib/api/fetch"
import type { SessionUser } from "@/lib/api/types"

export type SignInData = {
  token?: string
  refreshToken?: string
  user?: SessionUser
  redirect?: boolean
  url?: string
}

export type SocialProvider = "google" | "github"

export function isEmailIdentifier(value: string) {
  return value.includes("@")
}

export async function signOutWithToken(input: {
  token: string
  origin?: string | null
}) {
  return apiRequest<undefined>("/v1/user/sign/out", {
    method: "POST",
    token: input.token,
    headers: input.origin ? { Origin: input.origin } : undefined,
  })
}

export async function getProfile(token: string) {
  return apiRequest<{ user: SessionUser }>("/v1/user/me", { token })
}

export async function checkUsernameAvailable(username: string) {
  const params = new URLSearchParams({ username })
  return apiRequest<{ available: boolean }>(
    `/v1/user/check/username?${params.toString()}`
  )
}

export async function checkTelephoneAvailable(telephone: string) {
  const params = new URLSearchParams({ telephone })
  return apiRequest<{ available: boolean }>(
    `/v1/user/check/telephone?${params.toString()}`
  )
}

export async function completeOnboarding(input: {
  token: string
  username: string
  telephone: string
}) {
  return apiRequest<{ status: boolean }>("/v1/user/onboarding", {
    method: "PATCH",
    token: input.token,
    json: {
      username: input.username,
      telephone: input.telephone,
    },
  })
}

export async function updateProfile(input: {
  token: string
  name?: string
  username?: string
  telephone?: string
}) {
  return apiRequest<{ user: SessionUser }>("/v1/user/profile", {
    method: "PATCH",
    token: input.token,
    json: {
      name: input.name,
      username: input.username,
      telephone: input.telephone,
    },
  })
}

export async function sendVerificationOtp(email: string, captchaToken?: string) {
  return apiRequest<{ success?: boolean }>(
    getAuthPublicPath("/send/verification/email"),
    {
      method: "POST",
      json: { email, type: "email-verification" },
      captchaToken,
    }
  )
}

export async function verifyEmailOtp(input: { email: string; otp: string }) {
  return apiRequest<SignInData>(getAuthPublicPath("/verify/email"), {
    method: "POST",
    json: {
      email: input.email.trim(),
      otp: input.otp.trim(),
    },
  })
}

export async function requestPasswordReset(
  email: string,
  redirectTo: string,
  captchaToken?: string | null
) {
  return apiRequest<{ status?: boolean; message?: string }>(
    getAuthPublicPath("/forget/password"),
    {
      method: "POST",
      json: { email, redirectTo },
      captchaToken,
    }
  )
}

export async function resetPasswordWithToken(input: {
  token: string
  newPassword: string
}) {
  return apiRequest<{ status?: boolean }>(getAuthPublicPath("/reset/password"), {
    method: "POST",
    json: {
      token: input.token,
      newPassword: input.newPassword,
    },
  })
}
