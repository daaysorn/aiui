type AuthSessionContext = {
  session: {
    auth: {
      current?: {
        principalType?: string
        principalId?: string
      } | null
    }
  }
}

export type TenantCaller = {
  userId: string
}

export function requireTenantCaller(ctx: AuthSessionContext): TenantCaller {
  const caller = ctx.session.auth.current
  if (caller?.principalType !== "user" || !caller.principalId) {
    throw new Error("An authenticated user is required.")
  }
  return { userId: caller.principalId }
}
