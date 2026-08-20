import type { ReactNode } from "react"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell-transition-pending flex min-h-svh max-w-md min-w-0 flex-col p-6 md:mx-auto">
      <main className="w-full min-w-0 flex-1 text-left wrap-break-word">
        {children}
      </main>
    </div>
  )
}
