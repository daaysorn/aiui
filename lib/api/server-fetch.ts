import { headers } from "next/headers"

import { apiFetch, type ApiFetchOptions } from "@/lib/api/fetch"

export async function serverApiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const headerStore = await headers()
  const cookie = headerStore.get("cookie") ?? ""

  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(cookie ? { cookie } : {}),
    },
  })
}
