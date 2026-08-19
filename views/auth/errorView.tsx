import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"

export function AuthErrorView({ message }: { message?: string }) {
  return (
    <AuthShell
      title="Sign-in problem"
      description="Something went wrong while we tried to finish authentication."
    >
      <p className="text-sm text-muted-foreground">
        {message ?? "Try again or use email sign in."}
      </p>
      <Link href="/auth/sign-in" className="block">
        <Button className="w-full">Back to sign in</Button>
      </Link>
    </AuthShell>
  )
}
