import { Suspense } from "react"

import { AuthErrorView } from "@/views/auth/errorView"

type PageProps = {
  searchParams: Promise<{ message?: string }>
}

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <Suspense fallback={null}>
      <AuthErrorView message={params.message} />
    </Suspense>
  )
}
