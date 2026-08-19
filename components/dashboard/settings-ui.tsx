"use client"

import type { ReactNode } from "react"
import { SpinnerGapIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

function SettingsPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex w-full max-w-2xl flex-col gap-4", className)}>
      {children}
    </div>
  )
}

function SettingsCard({
  title,
  description,
  children,
  tone = "default",
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  tone?: "default" | "danger"
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-5 sm:p-6",
        tone === "danger" ? "bg-destructive/10" : "bg-muted/60",
        className
      )}
    >
      {title || description ? (
        <div className="flex min-w-0 flex-col gap-1">
          {title ? (
            <h3
              className={cn(
                "font-heading text-base font-semibold tracking-tight",
                tone === "danger" && "text-destructive"
              )}
            >
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

function SettingsStatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">{children}</div>
  )
}

function SettingsStat({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl bg-background/70 p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="font-heading text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function SettingsRow({
  leading,
  title,
  description,
  action,
  className,
}: {
  leading?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl bg-background/70 p-4 sm:p-5",
        className
      )}
    >
      <div className="flex min-w-0 gap-3">
        {leading ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            {leading}
          </span>
        ) : null}
        <div className="min-w-0 flex flex-col gap-1">
          <p className="text-sm font-medium">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function SettingsNotice({
  children,
  tone = "error",
}: {
  children: ReactNode
  tone?: "error" | "success"
}) {
  return (
    <p
      className={cn(
        "rounded-xl px-3 py-2.5 text-sm",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-success/10 text-success"
      )}
    >
      {children}
    </p>
  )
}

function SettingsLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-muted/60 p-5 text-sm text-muted-foreground">
      <SpinnerGapIcon className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

function SettingsEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-5 text-sm text-muted-foreground">
      {label}
    </div>
  )
}

export {
  SettingsCard,
  SettingsEmpty,
  SettingsLoading,
  SettingsNotice,
  SettingsPanel,
  SettingsRow,
  SettingsStat,
  SettingsStatGrid,
}
