import type { ReactNode } from "react"

export function HomeView({ actions }: { actions?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-6 text-sm leading-loose">
      <div className="space-y-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Build sites with Daaybot
        </h1>
        <p className="text-muted-foreground">
          Sign in to manage projects, workspace credits, and your builder
          notebook. Eve chat comes next.
        </p>
        {actions ? <div className="flex flex-wrap gap-2 pt-2">{actions}</div> : null}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Press <kbd>d</kbd> to toggle dark mode
      </p>
    </div>
  )
}
