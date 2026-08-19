import {
  emailOTPClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { envelopeFetch } from "@/lib/api/fetch"
import { getAuthBaseUrl } from "@/lib/env"

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  basePath: "/v1/auth",
  fetchOptions: {
    credentials: "include",
    customFetchImpl: envelopeFetch,
  },
  plugins: [
    emailOTPClient(),
    organizationClient(),
    usernameClient(),
    twoFactorClient(),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
