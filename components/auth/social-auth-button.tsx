"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SocialProvider } from "@/lib/api/auth"

import { LastUsedBadge } from "./last-used-badge"

function SocialAuthButton({
  label,
  icon,
  className,
  onClick,
  loading,
  disabled,
  lastUsed = false,
}: {
  label: string
  icon: React.ReactNode
  className?: string
  onClick: () => void
  loading: boolean
  disabled: boolean
  lastUsed?: boolean
}) {
  return (
    <div className="relative min-w-0">
      {lastUsed ? <LastUsedBadge /> : null}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn("w-full justify-center gap-2", className)}
        disabled={disabled || loading}
        onClick={onClick}
      >
        {loading ? "Redirecting..." : icon}
        {!loading ? label : null}
      </Button>
    </div>
  )
}

export { SocialAuthButton }
export type { SocialProvider }
