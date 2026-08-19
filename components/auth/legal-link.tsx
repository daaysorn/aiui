import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function LegalLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  const linkClassName = cn("text-foreground no-underline hover:opacity-80", className)

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a
        href={href}
        className={linkClassName}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={linkClassName}>
      {children}
    </Link>
  )
}

export { LegalLink }
