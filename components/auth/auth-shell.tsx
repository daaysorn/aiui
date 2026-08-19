import { cn } from "@/lib/utils"

function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        "flex min-h-svh w-full items-center justify-center px-6 py-12",
        className
      )}
    >
      <div className="mx-auto w-full max-w-sm min-w-0 sm:max-w-[26rem]">
        {children}
      </div>
    </main>
  )
}

export { AuthShell }
