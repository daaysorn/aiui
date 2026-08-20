"use server"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import type { Project } from "@/lib/api/types"

export type CreateProjectState = {
  error?: string
  id?: string
}

export async function createProjectAction(
  _previous: CreateProjectState | null,
  formData: FormData
): Promise<CreateProjectState> {
  const name = String(formData.get("name") ?? "").trim()
  const brief = String(formData.get("brief") ?? "").trim()

  try {
    const project = await serverApiRequest<Project>("/v1/projects", {
      method: "POST",
      json: {
        name,
        brief: brief || undefined,
      },
    })
    return { id: project.id }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not create project." }
  }
}
