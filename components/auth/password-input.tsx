"use client"

import { useState } from "react"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import {
  getPasswordStrength,
  getPasswordStrengthBars,
  type PasswordStrength,
} from "@/lib/site/password-strength"
import { cn } from "@/lib/utils"

function strengthBarClass(strength: PasswordStrength) {
  switch (strength) {
    case "weak":
      return "bg-destructive"
    case "medium":
      return "bg-amber-500"
    case "strong":
      return "bg-success"
    default:
      return "bg-muted"
  }
}

function PasswordInput({
  className,
  showStrength = false,
  value,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type"> & {
  showStrength?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const passwordValue = typeof value === "string" ? value : ""
  const strength = getPasswordStrength(passwordValue)
  const filledBars = getPasswordStrengthBars(strength)

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          className={cn("pe-10", className)}
          value={value}
          {...props}
        />
        <button
          type="button"
          className="absolute top-1/2 end-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground/70 transition-colors hover:text-muted-foreground"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeSlashIcon className="size-4" weight="fill" aria-hidden />
          ) : (
            <EyeIcon className="size-4" weight="fill" aria-hidden />
          )}
        </button>
      </div>
      {showStrength && strength !== "empty" ? (
        <div
          className="grid grid-cols-3 gap-1.5"
          role="meter"
          aria-label="Password strength"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-1 rounded-full transition-colors",
                index < filledBars ? strengthBarClass(strength) : "bg-muted"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { PasswordInput }
