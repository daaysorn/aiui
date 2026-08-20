"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { MoonIcon, SignOutIcon, SunIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"

import { AuthBrand } from "@/components/auth/auth-brand"
import { Button } from "@/components/ui/button"
import { clearSession } from "@/lib/api/client"

function OnboardingHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignOut() {
    await clearSession()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-10 flex h-14 items-center justify-between bg-background/80 px-6 backdrop-blur-sm">
      <AuthBrand />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )
          ) : (
            <span className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() => void handleSignOut()}
        >
          <SignOutIcon className="size-4" />
        </Button>
      </div>
    </header>
  )
}

export { OnboardingHeader }
