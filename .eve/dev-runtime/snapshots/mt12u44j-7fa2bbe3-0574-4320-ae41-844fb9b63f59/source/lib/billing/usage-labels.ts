import { AUTUMN_CREDITS_FEATURE_ID } from "@/lib/billing/features"

type UsageEventLike = {
  featureId: string
  value: number
  properties?: Record<string, unknown>
}

const FEATURE_USAGE_LABELS: Record<string, string> = {
  [AUTUMN_CREDITS_FEATURE_ID]: "Dashboard chat",
  credits: "Dashboard chat",
  ai_tokens: "AI tokens",
}

export function creditUsageEventLabel(event: UsageEventLike): string {
  const source = event.properties?.source
  if (typeof source === "string" && source.trim()) {
    if (source === "dashboard_chat") return "Dashboard chat"
    return source.trim()
  }

  const reason = event.properties?.reason
  if (typeof reason === "string" && reason.trim()) {
    return reason.trim()
  }

  return FEATURE_USAGE_LABELS[event.featureId] ?? event.featureId
}

export function creditUsageEventAmount(value: number): string {
  const amount = Math.max(0, Number.isFinite(value) ? value : 0)
  return `${amount} credit${amount === 1 ? "" : "s"}`
}

export function formatUsageEventTime(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "Recently"
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))
}
