import { redirect } from "next/navigation"

import { serverApiFetch } from "@/lib/api/server-fetch"
import type { SessionUser } from "@/lib/api/types"
import { SettingsView } from "@/views/dashboard/settingsView"

export default async function SettingsPage() {
  let user: SessionUser
  try {
    const result = await serverApiFetch<{ user: SessionUser }>("/v1/user/me")
    user = result.user
  } catch {
    redirect("/sign-in")
  }

  return <SettingsView user={user} />
}
