"use server"

import { revalidatePath } from "next/cache"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"

export type SettingsState = {
  error?: string
  message?: string
}

export async function updateProfileAction(
  _previous: SettingsState | null,
  formData: FormData
): Promise<SettingsState> {
  const name = String(formData.get("name") ?? "").trim()
  const username = String(formData.get("username") ?? "").trim()
  const telephone = String(formData.get("telephone") ?? "").trim()

  const image = String(formData.get("image") ?? "").trim()

  try {
    await serverApiRequest<{ user: unknown }>("/v1/user/profile", {
      method: "PATCH",
      json: {
        name,
        username: username || undefined,
        telephone: telephone || undefined,
        image: image || undefined,
      },
    })
    revalidatePath("/dashboard/account")
    revalidatePath("/dashboard/settings")
    return { message: "Profile updated." }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not update profile." }
  }
}

export type ChangePasswordState = {
  error?: string
  message?: string
}

export async function changePasswordAction(
  _previous: ChangePasswordState | null,
  formData: FormData
): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "")
  const newPassword = String(formData.get("newPassword") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  try {
    await serverApiRequest("/v1/user/password", {
      method: "PATCH",
      json: {
        currentPassword,
        newPassword,
      },
    })
    return { message: "Password updated." }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not change password." }
  }
}

export type LinkAccountState = {
  error?: string
  url?: string
}

export async function startLinkAccountAction(
  provider: "google" | "github",
  callbackURL: string
): Promise<LinkAccountState> {
  try {
    const result = await serverApiRequest<{ url?: string; redirect?: boolean }>(
      "/v1/user/accounts/link",
      {
        method: "POST",
        json: { provider, callbackURL },
      }
    )
    const url = typeof result.url === "string" ? result.url.trim() : ""
    if (!url) {
      return { error: "Could not start account link." }
    }
    return { url }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }
    return { error: "Could not start account link." }
  }
}

export type UnlinkAccountState = SettingsState

export async function unlinkAccountAction(
  provider: string
): Promise<UnlinkAccountState> {
  try {
    await serverApiRequest(`/v1/user/accounts/${encodeURIComponent(provider)}`, {
      method: "DELETE",
    })
    revalidatePath("/dashboard")
    return { message: "Account unlinked." }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }
    return { error: "Could not unlink account." }
  }
}

export type RevokeSessionState = SettingsState

export async function revokeSessionAction(
  sessionId: string
): Promise<RevokeSessionState> {
  try {
    await serverApiRequest(
      `/v1/user/sessions/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" }
    )
    return { message: "Session ended." }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }
    return { error: "Could not end session." }
  }
}

export async function revokeOtherSessionsAction(): Promise<RevokeSessionState> {
  try {
    await serverApiRequest("/v1/user/sessions?mode=others", {
      method: "DELETE",
    })
    return { message: "Other sessions ended." }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }
    return { error: "Could not end sessions." }
  }
}

export type DeleteAccountState = SettingsState

export async function deleteAccountAction(
  password: string | undefined
): Promise<DeleteAccountState> {
  try {
    await serverApiRequest("/v1/user", {
      method: "DELETE",
      json: password ? { password } : {},
    })
    return { message: "Account deleted." }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }
    return { error: "Could not delete account." }
  }
}
