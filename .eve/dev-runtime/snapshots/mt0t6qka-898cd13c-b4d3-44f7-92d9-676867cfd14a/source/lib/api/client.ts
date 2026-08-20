"use client"

export {
  authClient,
  consumePendingAuthMethod,
  getLastUsedLoginMethod,
  getSession,
  isLastUsedLoginMethod,
  rememberPendingAuthMethod,
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
