import { rewriteAuthRequestUrl, getApiBaseUrl } from "@/lib/api/config"
import {
  ApiError,
  isApiEnvelope,
  type ApiEnvelope,
} from "@/lib/api/envelope"

export class ApiRequestError extends ApiError {
  statusType?: string
  envelope?: ApiEnvelope<unknown>

  constructor(
    message: string,
    statusCode: number,
    options?: { statusType?: string; envelope?: ApiEnvelope<unknown> }
  ) {
    super(message, statusCode)
    this.name = "ApiRequestError"
    this.statusType = options?.statusType
    this.envelope = options?.envelope
  }
}

export type ApiFetchOptions = RequestInit & {
  json?: unknown
  token?: string | null
}

/**
 * Fetch against Nest with envelope unwrap (Better Auth client + typed calls).
 */
export async function apiFetch(
  input: string | URL | Request,
  init?: ApiFetchOptions
): Promise<Response> {
  const url = rewriteAuthRequestUrl(input)
  const headers = new Headers(init?.headers)

  if (init?.json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`)
  }

  if (typeof window !== "undefined" && !headers.has("Origin")) {
    headers.set("Origin", window.location.origin)
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body:
      init?.json !== undefined
        ? JSON.stringify(init.json)
        : init?.body,
    credentials: init?.credentials ?? "include",
  })

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return response
  }

  const payload: unknown = await response.json()

  if (!isApiEnvelope(payload)) {
    return new Response(JSON.stringify(payload), {
      status: response.status,
      statusText: response.statusText,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (payload.statusCode >= 400) {
    const errorBody = {
      message: payload.message,
      ...(payload.data && typeof payload.data === "object" ? payload.data : {}),
    }
    return new Response(JSON.stringify(errorBody), {
      status: payload.statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify(payload.data ?? null), {
    status: payload.statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Message": payload.message,
      "X-Api-Status-Type": payload.statusType ?? "",
    },
  })
}

export async function apiRequest<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<{ ok: boolean; status: number; envelope: ApiEnvelope<T> }> {
  const normalized = path.startsWith("/") ? path : `/${path}`
  const url = `${getApiBaseUrl()}${normalized}`
  const headers = new Headers(options.headers)

  if (options.json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`)
  }

  if (typeof window !== "undefined") {
    headers.set("Origin", window.location.origin)
  }

  const response = await fetch(url, {
    method: options.method ?? (options.json !== undefined ? "POST" : "GET"),
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    credentials: "include",
    signal: options.signal,
  })

  let envelope: ApiEnvelope<T>
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    envelope = {
      statusCode: response.status,
      statusType: response.statusText || "ERROR",
      message: response.statusText || "Request failed.",
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    envelope,
  }
}

export async function apiRequestOrThrow<T>(
  path: string,
  options?: ApiFetchOptions
) {
  const result = await apiRequest<T>(path, options)
  if (!result.ok) {
    throw new ApiRequestError(
      result.envelope.message || "Request failed.",
      result.status,
      { statusType: result.envelope.statusType, envelope: result.envelope }
    )
  }
  return result.envelope.data as T
}

export type { ApiFetchOptions as ApiRequestOptions }
