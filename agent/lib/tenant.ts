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

export function getTenantCaller(ctx: AuthSessionContext): TenantCaller | null {
  const caller = ctx.session.auth.current
  if (caller?.principalType !== "user" || !caller.principalId) {
    return null
  }
  return { userId: caller.principalId }
}

export function requireTenantCaller(ctx: AuthSessionContext): TenantCaller {
  const scope = getTenantCaller(ctx)
  if (!scope) {
    throw new Error("An authenticated user is required.")
  }
  return scope
}
