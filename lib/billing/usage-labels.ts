import { AUTUMN_CREDITS_FEATURE_ID } from "@/lib/billing/features"

type UsageEventLike = {
  id?: string
  featureId: string
  value: number
  timestamp?: number
  properties?: Record<string, unknown>
}

const FEATURE_USAGE_LABELS: Record<string, string> = {
  [AUTUMN_CREDITS_FEATURE_ID]: "Dashboard chat",
  credits: "Dashboard chat",
  ai_tokens: "AI tokens",
}

const LEDGER_REASON_LABELS: Record<string, string> = {
  "included usage": "Dashboard chat",
  "extra usage": "Extra usage",
  "signup grant": "Signup grant",
}

export type UsageTypeKey =
  | "dashboard_chat"
  | "project_build"
  | "extra_usage"
  | "other"

export type AggregatedUsageRow = {
  id: string
  type: UsageTypeKey
  label: string
  value: number
  timestamp: number
}

export function usageTypeKey(event: UsageEventLike): UsageTypeKey {
  const source = event.properties?.source
  if (source === "dashboard_chat") return "dashboard_chat"
  if (source === "project_build") return "project_build"

  const reason =
    typeof event.properties?.reason === "string"
      ? event.properties.reason.trim()
      : ""
  if (reason === "extra usage") return "extra_usage"
  if (event.properties?.projectId) return "project_build"
  if (reason === "included usage") return "dashboard_chat"

  return "other"
}

export function creditUsageEventLabel(event: UsageEventLike): string {
  const source = event.properties?.source
  if (typeof source === "string" && source.trim()) {
    if (source === "dashboard_chat") return "Dashboard chat"
    if (source === "project_build") return "Project build"
    return source.trim()
  }

  const reason = event.properties?.reason
  if (typeof reason === "string" && reason.trim()) {
    return LEDGER_REASON_LABELS[reason] ?? reason.trim()
  }

  if (event.properties?.projectId) {
    return "Project build"
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

export function aggregateUsageByType(
  events: UsageEventLike[]
): AggregatedUsageRow[] {
  const groups = new Map<
    UsageTypeKey,
    { label: string; value: number; timestamp: number }
  >()

  for (const event of events) {
    if (!(event.value > 0)) continue
    const type = usageTypeKey(event)
    const label = creditUsageEventLabel(event)
    const timestamp =
      typeof event.timestamp === "number" && Number.isFinite(event.timestamp)
        ? event.timestamp
        : 0
    const existing = groups.get(type)
    if (!existing) {
      groups.set(type, { label, value: event.value, timestamp })
      continue
    }
    existing.value += event.value
    if (timestamp > existing.timestamp) {
      existing.timestamp = timestamp
      existing.label = label
    }
  }

  return [...groups.entries()]
    .map(([type, row]) => ({
      id: type,
      type,
      label: row.label,
      value: row.value,
      timestamp: row.timestamp,
    }))
    .sort((left, right) => right.timestamp - left.timestamp)
}
