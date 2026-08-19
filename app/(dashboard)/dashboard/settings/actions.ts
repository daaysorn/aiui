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

  try {
    await serverApiRequest<{ user: unknown }>("/v1/user/profile", {
      method: "PATCH",
      json: {
        name,
        username: username || undefined,
        telephone: telephone || undefined,
      },
    })
    revalidatePath("/dashboard/settings")
    return { message: "Profile updated." }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not update profile." }
  }
}
