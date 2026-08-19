export const siteRoutes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  callback: "/callback",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
} as const

export const siteLinks = {
  terms: process.env.NEXT_PUBLIC_TERMS_URL ?? "/terms",
  privacy: process.env.NEXT_PUBLIC_PRIVACY_URL ?? "/privacy",
} as const
