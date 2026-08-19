export type SessionUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  username: string | null
  displayUsername: string | null
  telephone: string | null
  twoFactorEnabled: boolean
  role: string
  createdAt: string
  updatedAt: string
}

export type UserOverview = {
  user: SessionUser
  session: {
    expiresAt: string
    activeOrganizationId: string | null
    activeTeamId: string | null
  }
  organizations: Array<{
    id: string
    name: string
    slug: string
    logo: string | null
    role: string
  }>
  teams: Array<{
    id: string
    name: string
    organizationId: string
  }>
  workspaces: Array<{
    id: string
    name: string
    kind: "personal" | "organization"
    organizationId: string | null
    creditBalance: number
  }>
  billing: {
    audience: string
    workspaceId: string
    plan: {
      slug: string
      name: string
      billingType: string
    } | null
    credits: {
      balance: number
      granted: number
    }
    subscription: {
      status: string
      planId: string
    } | null
  }
}

export type BillingPlan = {
  slug: string
  name: string
  description: string | null
  audience: string
  billingType: string
  currency: string
  priceCents: number
  seatPriceCents: number
  minSeats: number
  includedCredits: number
  maxOrganizations: number
  extraUsageEnabled: boolean
  extraUsagePriceCents: number
  features: string[]
  trialDays: number | null
  sortOrder: number
}

export type Project = {
  id: string
  workspaceId: string
  name: string
  slug: string
  brief: string | null
  status: string
  lastError: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectDetail = Project & {
  threads: Array<{
    id: string
    projectId: string
    title: string
    eveSessionId: string | null
    status: string
    createdAt: string
    updatedAt: string
  }>
}
