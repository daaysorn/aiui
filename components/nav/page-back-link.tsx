import Link from "next/link"
import { CaretLeftIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

function PageBackLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex w-fit items-center gap-1 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground",
        className
      )}
    >
      <CaretLeftIcon className="size-4" aria-hidden />
      <span>Back</span>
    </Link>
  )
}

export { PageBackLink }
