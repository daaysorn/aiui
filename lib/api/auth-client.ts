"use client"

import {
  emailOTPClient,
  lastLoginMethodClient,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { getApiBaseUrl, getAuthBasePath } from "@/lib/api/config"
import { apiFetch } from "@/lib/api/fetch"

const LAST_USED_COOKIE = "better-auth.last_used_login_method"
const LAST_USED_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const LAST_USED_CHANGE_EVENT = "aiui:last-used-login-method"

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  basePath: getAuthBasePath(),
  plugins: [
    emailOTPClient(),
    lastLoginMethodClient(),
    organizationClient(),
    usernameClient(),
  ],
  fetchOptions: {
    customFetchImpl: apiFetch,
    credentials: "include",
  },
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient

export function syncLastUsedLoginMethodCookie(method: string) {
  if (typeof document === "undefined" || !method) {
    return
  }

  document.cookie = `${LAST_USED_COOKIE}=${encodeURIComponent(method)}; path=/; max-age=${LAST_USED_MAX_AGE_SECONDS}; SameSite=Lax`
  window.dispatchEvent(new Event(LAST_USED_CHANGE_EVENT))
}

export function subscribeLastUsedLoginMethod(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener(LAST_USED_CHANGE_EVENT, onStoreChange)
  window.addEventListener("focus", onStoreChange)

  return () => {
    window.removeEventListener(LAST_USED_CHANGE_EVENT, onStoreChange)
    window.removeEventListener("focus", onStoreChange)
  }
}

export function getLastUsedLoginMethod() {
  return authClient.getLastUsedLoginMethod()
}

export function isLastUsedLoginMethod(method: string) {
  return authClient.isLastUsedLoginMethod(method)
}
