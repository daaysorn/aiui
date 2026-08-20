import { createOpenAI } from "@ai-sdk/openai"
import type { LanguageModel } from "ai"

const GATEWAY_PROVIDERS = ["vercel", "openrouter", "litellm", "cencori"] as const

export type NestGatewayProvider = (typeof GATEWAY_PROVIDERS)[number]

export type NestGatewayRuntime = {
  provider: NestGatewayProvider
  model: string
  baseUrl: string
  apiKey: string
}

type NestEnvelope<T> = {
  data?: T
  statusCode?: number
  message?: string
}

let cachedRuntime: { value: NestGatewayRuntime; expiresAt: number } | null = null

function resolveApiOrigin(): string {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  const origin = raw.replace(/\/$/, "")
  if (!origin) {
    throw new Error("NEXT_PUBLIC_API_URL is missing.")
  }
  return origin
}

function resolveInternalToken(): string {
  const token = process.env.EVE_GATEWAY_INTERNAL_TOKEN?.trim()
  if (!token) {
    throw new Error("EVE_GATEWAY_INTERNAL_TOKEN is missing.")
  }
  return token
}

function isGatewayProvider(value: string): value is NestGatewayProvider {
  return (GATEWAY_PROVIDERS as readonly string[]).includes(value)
}

function unwrapNestData<T>(body: NestEnvelope<T> | T): T {
  if (body && typeof body === "object" && "data" in body && body.data) {
    return body.data
  }
  return body as T
}

/** Shared Nest AI gateway credentials (cached ~60s). Used by title summarization. */
export async function fetchNestGatewayRuntime(): Promise<NestGatewayRuntime> {
  const now = Date.now()
  if (cachedRuntime && cachedRuntime.expiresAt > now) {
    return cachedRuntime.value
  }

  const response = await fetch(`${resolveApiOrigin()}/v1/internal/eve/gateway`, {
    cache: "no-store",
    headers: {
      authorization: `Bearer ${resolveInternalToken()}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Nest gateway runtime request failed (${response.status}).`)
  }

  const runtime = unwrapNestData(
    (await response.json()) as NestEnvelope<NestGatewayRuntime> | NestGatewayRuntime
  )

  if (
    !isGatewayProvider(runtime.provider) ||
    !runtime.model?.trim() ||
    !runtime.apiKey?.trim()
  ) {
    throw new Error("Nest returned an invalid Eve gateway runtime payload.")
  }

  cachedRuntime = {
    value: runtime,
    expiresAt: now + 60_000,
  }

  return runtime
}

export async function resolveNestGatewayLanguageModel(): Promise<
  string | LanguageModel
> {
  const runtime = await fetchNestGatewayRuntime()

  if (runtime.provider === "vercel") {
    process.env.AI_GATEWAY_API_KEY = runtime.apiKey
    return runtime.model
  }

  const openai = createOpenAI({
    baseURL: runtime.baseUrl.replace(/\/$/, ""),
    apiKey: runtime.apiKey,
  })

  return openai.chat(runtime.model)
}
