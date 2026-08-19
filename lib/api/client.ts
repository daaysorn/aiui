"use client"

export {
  authClient,
  getLastUsedLoginMethod,
  getSession,
  isLastUsedLoginMethod,
  signIn,
  signOut,
  signUp,
  subscribeLastUsedLoginMethod,
  syncLastUsedLoginMethodCookie,
  useSession,
} from "@/lib/api/auth-client"

export {
  clearSession,
  persistSession,
  resolveSessionTokens,
  stripOAuthTokensFromCurrentUrl,
} from "@/lib/api/persist-session"
