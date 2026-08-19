import type { ReactNode } from "react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-svh w-full max-w-md min-w-0 flex-col justify-center px-4 py-10",
        className
      )}
    >
      <div className="mb-8 space-y-2 text-left">
        <Link href="/" className="font-heading text-sm font-semibold text-primary">
          daaysorn
        </Link>
        <p className="text-xs text-muted-foreground">AI website builder</p>
      </div>
      <Card className="w-full min-w-0">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footer ? (
          <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export function AuthMessage({
  tone = "error",
  children,
}: {
  tone?: "error" | "success"
  children: ReactNode
}) {
  return (
    <p
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-success/10 text-success"
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  )
}

export function AuthField({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string
  htmlFor: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
