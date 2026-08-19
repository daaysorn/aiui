import { ApiError, isApiEnvelope } from "@/lib/api/envelope"

type ApiFetchOptions = RequestInit & {
  json?: unknown
}

export type { ApiFetchOptions }

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { json, headers, ...rest } = options
  const init: RequestInit = {
    credentials: "include",
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  }

  const response = await fetch(path, init)
  const contentType = response.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const payload = isJson ? await response.json() : null

  if (isApiEnvelope(payload)) {
    if (payload.statusCode >= 400) {
      throw new ApiError(
        payload.message,
        payload.statusCode,
        payload.data &&
          typeof payload.data === "object" &&
          !Array.isArray(payload.data)
          ? (payload.data as Record<string, unknown>).code?.toString()
          : undefined
      )
    }
    return payload.data as T
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : response.statusText || "Request failed"
    throw new ApiError(message, response.status)
  }

  return payload as T
}

/** Unwrap handleResponse envelopes for Better Auth client fetch. */
export async function envelopeFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
  })

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return response
  }

  const payload: unknown = await response.json()
  if (!isApiEnvelope(payload)) {
    return new Response(JSON.stringify(payload), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    })
  }

  const status = payload.statusCode
  if (status >= 400) {
    const errorBody = {
      message: payload.message,
      ...(payload.data && typeof payload.data === "object"
        ? payload.data
        : {}),
    }
    return new Response(JSON.stringify(errorBody), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify(payload.data ?? {}), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
