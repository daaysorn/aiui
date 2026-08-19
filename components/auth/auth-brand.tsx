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
    <Link
      href={href}
      className={cn(
        "inline-flex min-w-0 items-center gap-2 font-medium text-foreground",
        className
      )}
    >
      <BrandEmojiCycle />
      <span className="motion-safe:animate-text-shimmer animation-duration-[2.8s]">
        daaybot
      </span>
    </Link>
  )
}

export { AuthBrand }
