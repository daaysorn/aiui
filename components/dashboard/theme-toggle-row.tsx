"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  DesktopIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const themeOptions = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: DesktopIcon },
] as const

function ThemeWindow({ scheme }: { scheme: "light" | "dark" }) {
  const isLight = scheme === "light"
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-14 w-full overflow-hidden rounded-lg",
        isLight ? "bg-neutral-100" : "bg-neutral-950"
      )}
    >
      <span className={cn("w-[22%]", isLight ? "bg-neutral-200" : "bg-black")} />
      <span className="flex flex-1 flex-col justify-center gap-1.5 px-2">
        <span
          className={cn(
            "h-1.5 w-[78%] rounded-full",
            isLight ? "bg-neutral-300" : "bg-neutral-700"
          )}
        />
        <span
          className={cn(
            "h-1.5 w-[52%] rounded-full",
            isLight ? "bg-neutral-300" : "bg-neutral-700"
          )}
        />
      </span>
    </span>
  )
}

function ThemePreview({ value }: { value: "light" | "dark" | "system" }) {
  if (value === "system") {
    return (
      <span className="relative block h-14 overflow-hidden rounded-lg">
        <ThemeWindow scheme="light" />
        <span className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
          <ThemeWindow scheme="dark" />
        </span>
      </span>
    )
  }

  return <ThemeWindow scheme={value} />
}

function ThemeToggleRow({
  variant = "compact",
}: {
  variant?: "compact" | "cards"
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const current = mounted ? theme : undefined

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map((option) => {
          const active = current === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-label={option.label}
              aria-pressed={active}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-xl p-2 text-muted-foreground",
                active && "bg-background text-foreground"
              )}
              onClick={() => setTheme(option.value)}
            >
              <ThemePreview value={option.value} />
              <span className="text-center text-xs font-medium">{option.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="flex gap-1 rounded-xl bg-muted p-1"
      onPointerDown={(event) => event.preventDefault()}
    >
      {themeOptions.map((option) => {
        const Icon = option.icon
        const active = current === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={active}
            className={cn(
              "flex h-8 flex-1 cursor-pointer items-center justify-center rounded-lg text-muted-foreground",
              active && "bg-background text-foreground"
            )}
            onClick={() => setTheme(option.value)}
          >
            <Icon className="size-4" weight={active ? "fill" : "duotone"} />
          </button>
        )
      })}
    </div>
  )
}

export { ThemeToggleRow }
