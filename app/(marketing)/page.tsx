import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getServerSession } from "@/lib/session"
import { HomeView } from "@/views/homeView"

export default async function HomePage() {
  const session = await getServerSession()
  if (session?.user?.emailVerified) {
    redirect("/dashboard")
  }

  return (
    <HomeView
      actions={
        <>
          <Button render={<Link href="/auth/sign-up" />}>Create account</Button>
          <Button variant="outline" render={<Link href="/auth/sign-in" />}>
            Sign in
          </Button>
        </>
      }
    />
  )
}
