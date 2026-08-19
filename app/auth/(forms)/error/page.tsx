import Link from "next/link"

import { Button } from "@/components/ui/button"
import { siteRoutes } from "@/lib/site"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">Sign-in problem</h1>
      <p className="text-sm text-muted-foreground">
        {params.message ?? "Something went wrong while finishing authentication."}
      </p>
      <Button render={<Link href={siteRoutes.signIn} />}>Back to sign in</Button>
    </div>
  )
}
