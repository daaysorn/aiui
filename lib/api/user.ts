import { apiFetch } from "@/lib/api/fetch"
import type { SessionUser, UserOverview } from "@/lib/api/types"

export async function getUserOverview(): Promise<UserOverview> {
  return apiFetch<UserOverview>("/v1/user/overview")
}

export async function getUserMe(): Promise<{ user: SessionUser }> {
  return apiFetch<{ user: SessionUser }>("/v1/user/me")
}

export async function completeOnboarding(body: {
  username: string
  telephone: string
}): Promise<{ status: boolean }> {
  return apiFetch<{ status: boolean }>("/v1/user/onboarding", {
    method: "PATCH",
    json: body,
  })
}

export async function checkUsername(username: string): Promise<{
  available: boolean
}> {
  const params = new URLSearchParams({ username })
  return apiFetch<{ available: boolean }>(
    `/v1/user/check/username?${params.toString()}`
  )
}

export async function checkTelephone(telephone: string): Promise<{
  available: boolean
}> {
  const params = new URLSearchParams({ telephone })
  return apiFetch<{ available: boolean }>(
    `/v1/user/check/telephone?${params.toString()}`
  )
}

export async function updateProfile(body: {
  name?: string
  username?: string
  telephone?: string
  image?: string
}): Promise<{ status: boolean; user: SessionUser }> {
  return apiFetch<{ status: boolean; user: SessionUser }>("/v1/user/profile", {
    method: "PATCH",
    json: body,
  })
}

export async function signOutUser(): Promise<void> {
  await apiFetch<undefined>("/v1/user/sign/out", { method: "POST" })
}
