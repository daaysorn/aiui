import { createOpenAI } from "@ai-sdk/openai"
import type { LanguageModel } from "ai"

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
const DEFAULT_CENCORI_BASE_URL = "https://api.cencori.com/v1"

const GATEWAY_PROVIDERS = ["vercel", "openrouter", "litellm", "cencori"] as const

export type NestGatewayProvider = (typeof GATEWAY_PROVIDERS)[number]

export type NestGatewayPolicy = {
  provider: NestGatewayProvider
  model: string
  configured: Record<NestGatewayProvider, boolean>
  ready: boolean
}

type GatewayEnv = {
  AI_GATEWAY_API_KEY?: string
  OPENROUTER_API_KEY?: string
  LITELLM_BASE_URL?: string
  LITELLM_API_KEY?: string
  CENCORI_API_KEY?: string
  CENCORI_BASE_URL?: string
}

type GatewayRequest = {
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

let cachedPolicy: { value: NestGatewayPolicy; expiresAt: number } | null = null

function resolveApiOrigin(): string {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  const origin = raw.replace(/\/$/, "")
  if (!origin) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Set it in aiui/.env.local so Daaybot can load gateway policy from Nest.",
    )
  }
  return origin
}

function readGatewayEnv(): GatewayEnv {
  return {
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY?.trim(),
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.trim(),
    LITELLM_BASE_URL: process.env.LITELLM_BASE_URL?.trim(),
    LITELLM_API_KEY: process.env.LITELLM_API_KEY?.trim(),
    CENCORI_API_KEY: process.env.CENCORI_API_KEY?.trim(),
    CENCORI_BASE_URL: process.env.CENCORI_BASE_URL?.trim(),
  }
}

function isGatewayProvider(value: string): value is NestGatewayProvider {
  return (GATEWAY_PROVIDERS as readonly string[]).includes(value)
}

function providerCredentialHint(provider: NestGatewayProvider): string {
  switch (provider) {
    case "vercel":
      return "AI_GATEWAY_API_KEY"
    case "openrouter":
      return "OPENROUTER_API_KEY"
    case "litellm":
      return "LITELLM_BASE_URL and LITELLM_API_KEY"
    case "cencori":
      return "CENCORI_API_KEY"
  }
}

function resolveGatewayRequest(
  policy: NestGatewayPolicy,
  env: GatewayEnv,
): GatewayRequest | null {
  const model = policy.model.trim()
  if (!model) {
    return null
  }

  switch (policy.provider) {
    case "vercel": {
      const apiKey = env.AI_GATEWAY_API_KEY ?? ""
      if (!apiKey) {
        return null
      }
      return {
        provider: "vercel",
        model,
        baseUrl: "",
        apiKey,
      }
    }
    case "openrouter": {
      const apiKey = env.OPENROUTER_API_KEY ?? ""
      if (!apiKey) {
        return null
      }
      return {
        provider: "openrouter",
        model,
        baseUrl: OPENROUTER_BASE_URL,
        apiKey,
      }
    }
    case "litellm": {
      const baseUrl = env.LITELLM_BASE_URL ?? ""
      const apiKey = env.LITELLM_API_KEY ?? ""
      if (!baseUrl || !apiKey) {
        return null
      }
      return {
        provider: "litellm",
        model,
        baseUrl,
        apiKey,
      }
    }
    case "cencori": {
      const apiKey = env.CENCORI_API_KEY ?? ""
      if (!apiKey) {
        return null
      }
      return {
        provider: "cencori",
        model,
        baseUrl: env.CENCORI_BASE_URL || DEFAULT_CENCORI_BASE_URL,
        apiKey,
      }
    }
  }
}

export async function fetchNestGatewayPolicy(): Promise<NestGatewayPolicy> {
  const now = Date.now()
  if (cachedPolicy && cachedPolicy.expiresAt > now) {
    return cachedPolicy.value
  }

  const response = await fetch(`${resolveApiOrigin()}/v1/billing/gateway`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `Nest gateway policy request failed (${response.status}). Is builderbackend running?`,
    )
  }

  const body = (await response.json()) as NestEnvelope<NestGatewayPolicy> | NestGatewayPolicy
  const policy = ("data" in body && body.data ? body.data : body) as NestGatewayPolicy

  if (!isGatewayProvider(policy.provider) || !policy.model?.trim()) {
    throw new Error("Nest returned an invalid AI gateway policy.")
  }

  cachedPolicy = {
    value: policy,
    expiresAt: now + 60_000,
  }

  return policy
}

export async function resolveNestGatewayModel(): Promise<string | LanguageModel> {
  const policy = await fetchNestGatewayPolicy()
  const env = readGatewayEnv()
  const request = resolveGatewayRequest(policy, env)

  if (!request) {
    const hint = providerCredentialHint(policy.provider)
    throw new Error(
      `AI gateway "${policy.provider}" is active in Nest but Daaybot is missing ${hint} in aiui/.env.local.`,
    )
  }

  if (request.provider === "vercel") {
    return request.model
  }

  const openai = createOpenAI({
    baseURL: request.baseUrl.replace(/\/$/, ""),
    apiKey: request.apiKey,
  })

  return openai.chat(request.model)
}
