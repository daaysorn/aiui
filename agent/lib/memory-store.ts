export type MemoryScope = {
  userId: string
}

export type Memory = {
  key: string
  value: string
  updatedAt: string
}

type NestEnvelope<T> = {
  data?: T
  statusCode?: number
  message?: string
}

function resolveApiOrigin(): string {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  const origin = raw.replace(/\/$/, "")
  if (!origin) {
    throw new Error("NEXT_PUBLIC_API_URL is missing for Eve memory.")
  }
  return origin
}

function resolveInternalToken(): string {
  const token = process.env.EVE_GATEWAY_INTERNAL_TOKEN?.trim()
  if (!token) {
    throw new Error("EVE_GATEWAY_INTERNAL_TOKEN is missing for Eve memory.")
  }
  return token
}

function unwrapNestData<T>(body: NestEnvelope<T> | T): T {
  if (body && typeof body === "object" && "data" in body && body.data) {
    return body.data
  }
  return body as T
}

async function nestMemoryRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${resolveApiOrigin()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${resolveInternalToken()}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })
  const body = (await response.json()) as NestEnvelope<T>
  if (!response.ok) {
    throw new Error(body.message || `Memory request failed (${response.status})`)
  }
  return unwrapNestData(body)
}

export const memoryStore = {
  async list(
    scope: MemoryScope,
    options: { limit: number }
  ): Promise<Memory[]> {
    const params = new URLSearchParams({
      userId: scope.userId,
      limit: String(options.limit),
    })
    const result = await nestMemoryRequest<{ memories: Memory[] }>(
      `/v1/internal/eve/memory?${params.toString()}`
    )
    return result.memories ?? []
  },

  async put(
    scope: MemoryScope,
    memory: { key: string; value: string }
  ): Promise<Memory> {
    return nestMemoryRequest<Memory>("/v1/internal/eve/memory", {
      method: "PUT",
      body: JSON.stringify({
        userId: scope.userId,
        key: memory.key,
        value: memory.value,
      }),
    })
  },

  async delete(scope: MemoryScope, key: string): Promise<boolean> {
    const params = new URLSearchParams({
      userId: scope.userId,
      key,
    })
    const result = await nestMemoryRequest<{ deleted: boolean }>(
      `/v1/internal/eve/memory?${params.toString()}`,
      { method: "DELETE" }
    )
    return Boolean(result.deleted)
  },
}
