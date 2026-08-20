/** Autumn metered feature for workspace credits (matches backend AUTUMN_CREDITS_FEATURE_ID). */
export const AUTUMN_CREDITS_FEATURE_ID =
  process.env.NEXT_PUBLIC_AUTUMN_CREDITS_FEATURE_ID?.trim() || "credits"

/**
 * Credits consumed per dashboard chat message (UX gate + Autumn track).
 *
 * Pricing math (Pro $20 / 2000 credits = $0.01 per credit included; extra usage $0.05/credit):
 * - Exa via AI Gateway: free through 2026-08-31, then ~$7/1k ≈ $0.007 per search
 * - Typical mini-model turn: ~$0.001–$0.005; with tools/search often ~$0.01–$0.015 COGS
 * - 1 credit ($0.01) under-covers search-heavy turns on included Pro rate
 * - 3 credits ($0.03 included / $0.15 extra) keeps margin after Exa goes paid
 *
 * Free signup (100 credits) ≈ 33 chat turns as a trial loss-leader.
 */
export const CHAT_MESSAGE_CREDIT_COST = 3

export type FeatureAccessResult = {
  allowed: boolean
}
