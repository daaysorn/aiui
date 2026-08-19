import { redirect } from "next/navigation"

import { getUserOverview } from "@/lib/session"
import { OverviewView } from "@/views/dashboard/overviewView"

export default async function DashboardPage() {
  const overview = await getUserOverview()
  if (!overview) {
    redirect("/sign-in")
  }

  return <OverviewView overview={overview} />
}
