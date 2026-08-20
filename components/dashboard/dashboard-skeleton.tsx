import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-52" />
      <div className="mt-2 flex flex-col gap-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  )
}

/** Placeholder that matches the New bot chat window while a thread hydrates. */
export function ChatWindowSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading chat"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <div className="flex justify-center py-1">
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-12 w-[min(100%,18rem)] rounded-2xl" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-20 w-[min(100%,22rem)] rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-[min(100%,14rem)] rounded-2xl" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-[min(100%,20rem)] rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-background px-4 py-3">
        <Skeleton className="mx-auto h-14 w-full max-w-2xl rounded-2xl" />
        <div className="mt-2 flex justify-center">
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
    </div>
  )
}
