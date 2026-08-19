export type ApiEnvelope<T> = {
  statusCode: number
  statusType: string
  message: string
  data?: T
}

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.statusCode === "number" &&
    typeof record.statusType === "string" &&
    typeof record.message === "string"
  )
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly code?: string

  constructor(message: string, statusCode: number, code?: string) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
  }
}

export function envelopeCode(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return undefined
  }
  const record = data as Record<string, unknown>
  if (typeof record.code === "string") {
    return record.code
  }
  return undefined
}
