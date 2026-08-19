import { apiFetch } from "@/lib/api/fetch"

export async function listOrganisations(): Promise<{
  organizations: Array<{
    id: string
    name: string
    slug: string
    logo: string | null
    createdAt: string
  }>
}> {
  return apiFetch("/v1/organisation")
}

export async function createOrganisation(body: {
  name: string
  slug: string
}): Promise<{ id: string; name: string; slug: string }> {
  return apiFetch("/v1/organisation", {
    method: "POST",
    json: body,
  })
}

export async function setActiveOrganisation(organizationId: string | null) {
  return apiFetch("/v1/organisation/active", {
    method: "POST",
    json: { organizationId },
  })
}
