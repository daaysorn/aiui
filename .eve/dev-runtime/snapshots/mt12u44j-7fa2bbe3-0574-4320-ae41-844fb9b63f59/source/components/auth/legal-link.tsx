import Link from "next/link"
import type { MouseEventHandler, ReactNode } from "react"

import { cn } from "@/lib/utils"

function LegalLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
  const linkClassName = cn("text-foreground no-underline hover:opacity-80", className)

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a
        href={href}
        className={linkClassName}
        rel="noopener noreferrer"
        target="_blank"
        onClick={onClick}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={linkClassName} onClick={onClick}>
      {children}
    </Link>
  )
}

export { LegalLink }
