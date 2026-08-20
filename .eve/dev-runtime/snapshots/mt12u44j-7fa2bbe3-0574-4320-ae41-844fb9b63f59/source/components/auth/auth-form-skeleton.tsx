import { AuthBrand } from "@/components/auth/auth-brand"
import { Skeleton } from "@/components/ui/skeleton"

function AuthFormSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-8" aria-hidden>
      <header className="flex items-center justify-between gap-4">
        <AuthBrand />
        <Skeleton className="h-8 w-24" />
      </header>
      <div className="flex min-w-0 flex-col gap-3">
        <Skeleton className="h-8 w-28 xs:h-9" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export { AuthFormSkeleton }
