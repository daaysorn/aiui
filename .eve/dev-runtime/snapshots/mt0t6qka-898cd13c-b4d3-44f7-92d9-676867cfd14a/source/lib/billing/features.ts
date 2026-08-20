/** Autumn metered feature for workspace credits (matches backend AUTUMN_CREDITS_FEATURE_ID). */
export const AUTUMN_CREDITS_FEATURE_ID =
  process.env.NEXT_PUBLIC_AUTUMN_CREDITS_FEATURE_ID?.trim() || "credits"

/** Credits consumed per dashboard chat message (UX gate + server track). */
export const CHAT_MESSAGE_CREDIT_COST = 1

export type FeatureAccessResult = {
  allowed: boolean
}
