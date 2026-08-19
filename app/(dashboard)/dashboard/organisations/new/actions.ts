"use server"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"

export type CreateOrganisationState = {
  error?: string
  slug?: string
}

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

function pickSlug(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback
  const record = payload as Record<string, unknown>
  if (typeof record.slug === "string" && record.slug) return record.slug
  const nested = record.organization
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const slug = (nested as Record<string, unknown>).slug
    if (typeof slug === "string" && slug) return slug
  }
  return fallback
}

export async function createOrganisationAction(
  _previous: CreateOrganisationState | null,
  formData: FormData
): Promise<CreateOrganisationState> {
  const name = String(formData.get("name") ?? "").trim()
  const slug = slugFromName(name)

  if (!slug) {
    return { error: "Enter a valid organisation name." }
  }

  try {
    const organisation = await serverApiRequest<unknown>("/v1/organisation", {
      method: "POST",
      json: { name, slug },
    })
    return { slug: pickSlug(organisation, slug) }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not create organisation." }
  }
}
