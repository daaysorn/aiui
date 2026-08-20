import Link from "next/link"

import { BrandEmojiCycle } from "@/components/brand/emoji-cycle"
import { cn } from "@/lib/utils"

function AuthBrand({
  href = "/",
  className,
}: {
  href?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 text-foreground",
        className
      )}
    >
      <BrandEmojiCycle />
      <Link
        href={href}
        className="font-semibold motion-safe:animate-text-shimmer"
      >
        Daaybot
      </Link>
    </span>
  )
}

export { AuthBrand }
