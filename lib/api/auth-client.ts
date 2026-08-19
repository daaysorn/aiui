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
const LAST_USED_STORAGE_KEY = "aiui:last-used-login-method"
const PENDING_AUTH_METHOD_KEY = "aiui:pending-auth-method"
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

export function rememberPendingAuthMethod(method: string) {
  if (typeof sessionStorage === "undefined" || !method) {
    return
  }

  sessionStorage.setItem(PENDING_AUTH_METHOD_KEY, method)
}

export function consumePendingAuthMethod() {
  if (typeof sessionStorage === "undefined") {
    return null
  }

  const method = sessionStorage.getItem(PENDING_AUTH_METHOD_KEY)
  if (method) {
    sessionStorage.removeItem(PENDING_AUTH_METHOD_KEY)
  }
  return method
}

export function syncLastUsedLoginMethodCookie(method: string) {
  if (typeof document === "undefined" || !method) {
    return
  }

  document.cookie = `${LAST_USED_COOKIE}=${encodeURIComponent(method)}; path=/; max-age=${LAST_USED_MAX_AGE_SECONDS}; SameSite=Lax`

  try {
    localStorage.setItem(LAST_USED_STORAGE_KEY, method)
  } catch {
    // Ignore private mode quota errors.
  }

  window.dispatchEvent(new Event(LAST_USED_CHANGE_EVENT))
}

export function subscribeLastUsedLoginMethod(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener(LAST_USED_CHANGE_EVENT, onStoreChange)
  window.addEventListener("focus", onStoreChange)
  window.addEventListener("storage", onStoreChange)

  return () => {
    window.removeEventListener(LAST_USED_CHANGE_EVENT, onStoreChange)
    window.removeEventListener("focus", onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

export function getLastUsedLoginMethod() {
  const fromCookie = authClient.getLastUsedLoginMethod()
  if (fromCookie) {
    return fromCookie
  }

  try {
    return localStorage.getItem(LAST_USED_STORAGE_KEY)
  } catch {
    return null
  }
}

export function isLastUsedLoginMethod(method: string) {
  return getLastUsedLoginMethod() === method
}
