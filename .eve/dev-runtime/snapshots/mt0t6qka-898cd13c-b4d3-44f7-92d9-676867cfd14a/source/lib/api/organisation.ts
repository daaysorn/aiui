import { apiRequest } from "@/lib/api/fetch"

type OrganisationSummary = {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: string
}

async function requireData<T>(
  result: Awaited<ReturnType<typeof apiRequest<T>>>
): Promise<T> {
  if (!result.ok || result.envelope.data === undefined) {
    throw new Error(result.envelope.message || "Request failed.")
  }

  return result.envelope.data
}

export async function listOrganisations(token: string) {
  const result = await apiRequest<{ organizations: OrganisationSummary[] }>(
    "/v1/organisation",
    { token }
  )
  return requireData(result)
}

export async function createOrganisation(
  token: string,
  body: { name: string; slug: string }
) {
  const result = await apiRequest<{ id: string; name: string; slug: string }>(
    "/v1/organisation",
    {
      method: "POST",
      token,
      json: body,
    }
  )
  return requireData(result)
}

export async function setActiveOrganisation(
  token: string,
  organizationId: string | null
) {
  const result = await apiRequest<{ ok?: boolean }>("/v1/organisation/active", {
    method: "POST",
    token,
    json: { organizationId },
  })
  return requireData(result)
}
