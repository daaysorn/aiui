"use client"

import { useEffect, useRef, useState } from "react"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const COLLAPSED_MAX_HEIGHT_PX = 160

export function CollapsibleUserBubbleText({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [children])

  useEffect(() => {
    const node = contentRef.current
    if (!node) return

    const measure = () => {
      setOverflows(node.scrollHeight > COLLAPSED_MAX_HEIGHT_PX + 1)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [children])

  const collapsed = overflows && !expanded

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={contentRef}
        className={cn(
          "whitespace-pre-wrap wrap-break-word",
          collapsed && "max-h-40 overflow-hidden"
        )}
      >
        {children}
      </div>
      {overflows ? (
        <div
          className={cn(
            "relative",
            collapsed &&
              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary from-35% via-secondary/85 to-transparent pt-10"
          )}
        >
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1 pt-1 text-xs font-medium text-secondary-foreground/80 transition-colors hover:text-secondary-foreground"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "Show more"}
            {expanded ? (
              <CaretUpIcon className="size-3" weight="bold" />
            ) : (
              <CaretDownIcon className="size-3" weight="bold" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  )
}
