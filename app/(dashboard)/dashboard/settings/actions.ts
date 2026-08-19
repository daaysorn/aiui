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
    await serverApiRequest("/v1/user/change-password", {
      method: "POST",
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
