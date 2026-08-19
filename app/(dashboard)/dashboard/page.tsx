import { redirect } from "next/navigation"

import { serverApiFetch } from "@/lib/api/server-fetch"
import type { UserOverview } from "@/lib/api/types"
import { OverviewView } from "@/views/dashboard/overviewView"

export default async function DashboardPage() {
  let overview: UserOverview
  try {
    overview = await serverApiFetch<UserOverview>("/v1/user/overview")
  } catch {
    redirect("/auth/sign-in")
  }

  return <OverviewView overview={overview} />
}
