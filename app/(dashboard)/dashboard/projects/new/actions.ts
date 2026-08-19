"use server"

import { redirect } from "next/navigation"

import { ApiRequestError } from "@/lib/api/fetch"
import { serverApiRequest } from "@/lib/api/server-fetch"
import type { Project } from "@/lib/api/types"

export type CreateProjectState = {
  error?: string
}

export async function createProjectAction(
  _previous: CreateProjectState | null,
  formData: FormData
): Promise<CreateProjectState> {
  const name = String(formData.get("name") ?? "").trim()
  const brief = String(formData.get("brief") ?? "").trim()

  let project: Project

  try {
    project = await serverApiRequest<Project>("/v1/projects", {
      method: "POST",
      json: {
        name,
        brief: brief || undefined,
      },
    })
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message }
    }

    return { error: "Could not create project." }
  }

  redirect(`/dashboard/projects/${project.id}`)
}
