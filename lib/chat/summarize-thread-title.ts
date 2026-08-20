"use server"

import { generateText } from "ai"

import { resolveNestGatewayLanguageModel } from "@/lib/chat/nest-gateway-runtime"
import { normalizeGeneratedThreadTitle } from "@/lib/chat/thread-title"
import { getAccessToken } from "@/lib/session"

/**
 * Cheap LLM title for Recents after the first user message.
 * Returns null on auth/gateway failure so the heuristic title stays.
 */
export async function summarizeThreadTitle(
  message: string
): Promise<string | null> {
  const token = await getAccessToken()
  if (!token) {
    return null
  }

  const source = message.trim().replace(/\s+/g, " ").slice(0, 480)
  if (!source) {
    return null
  }

  try {
    const model = await resolveNestGatewayLanguageModel()
    const { text } = await generateText({
      model,
      temperature: 0.2,
      maxOutputTokens: 24,
      prompt: [
        "Write a short chat thread title for the user message below.",
        "Rules: 2 to 6 words, topic-focused, no quotes, no trailing punctuation.",
        "Reply with the title only.",
        "",
        `Message: ${source}`,
      ].join("\n"),
    })

    return normalizeGeneratedThreadTitle(text)
  } catch {
    return null
  }
}
