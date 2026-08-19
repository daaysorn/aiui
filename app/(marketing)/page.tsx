import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getServerUser } from "@/lib/session"
import { siteRoutes } from "@/lib/site"
import { HomeView } from "@/views/homeView"

export default async function HomePage() {
  const user = await getServerUser()
  if (user?.emailVerified) {
    redirect(siteRoutes.dashboard)
  }

  return (
    <HomeView
      actions={
        <>
          <Button render={<Link href={siteRoutes.signUp} />}>Create account</Button>
          <Button variant="outline" render={<Link href={siteRoutes.signIn} />}>
            Sign in
          </Button>
        </>
      }
    />
  )
}
