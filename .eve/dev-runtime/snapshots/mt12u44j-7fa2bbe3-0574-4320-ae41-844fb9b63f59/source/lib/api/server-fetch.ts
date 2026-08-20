import { cookies } from "next/headers"

import { AIUI_ACCESS_COOKIE } from "@/lib/api/cookies"
import { apiRequestOrThrow } from "@/lib/api/fetch"

export async function serverApiRequest<T>(
  path: string,
  options: RequestInit & { json?: unknown; method?: string } = {}
): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AIUI_ACCESS_COOKIE)?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  const data = await apiRequestOrThrow<T>(path, {
    ...options,
    token,
    json: options.json,
  })

  return data
}

export const serverApiFetch = serverApiRequest
