// ── User ─────────────────────────────────────────────────────────────────────

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

export type LinkedAccount = {
  id: string
  accountId: string
  providerId: string
  userId: string
  createdAt: string
  updatedAt: string
  scopes?: string[]
}

export type UserSession = {
  id: string
  token: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  browser: string | null
  browserVersion: string | null
  platform: string | null
  platformVersion: string | null
  architecture: string | null
  device: string | null
  deviceName: string | null
  userAgent: string | null
  current: boolean
  userId: string
  activeOrganizationId: string | null
  activeTeamId: string | null
  impersonatedBy: string | null
}

export type OverviewWorkspace = {
  id: string
  name: string
  kind: "personal" | "organization"
  organizationId: string | null
  creditBalance: number
  seatCount?: number
  extraUsageEnabled?: boolean
  extraUsageCapCents?: number | null
  extraUsageSpentCents?: number
  extraUsageBalanceCents?: number
  plan: { slug: string; name: string; billingType: string } | null
}

export type UserOverview = {
  user: SessionUser
  session: {
    id?: string
    token?: string
    expiresAt?: string
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
  workspaces: OverviewWorkspace[]
  billing: {
    audience: "workspace"
    workspaceId: string | null
    plan: { slug: string; name: string; billingType: string } | null
    credits: { balance: number; granted: number }
    extraUsage: {
      enabled: boolean
      capCents: number | null
      spentCents: number
      balanceCents: number
    }
    subscription: CustomerBillingView
  }
}

// ── Billing ───────────────────────────────────────────────────────────────────

export type PublicPaymentMethod = {
  brand: string | null
  last4: string | null
  expMonth: number | null
  expYear: number | null
}

export type CustomerBillingView = {
  planId: string | null
  status: string | null
  currentPeriodStart: number | null
  currentPeriodEnd: number | null
  canceledAt: number | null
  pastDue: boolean
  autoCharge: boolean
  paymentMethod: PublicPaymentMethod | null
}

export type BillingUsage = {
  workspaceId: string
  creditBalance: number
  seatCount: number
  extraUsageEnabled: boolean
  extraUsageCapCents: number | null
  extraUsageSpentCents: number
  extraUsageBalanceCents: number
  extraUsagePeriodStart: string | null
  plan: { extraUsageEnabled: boolean; extraUsagePriceCents: number } | null
  subscription: CustomerBillingView
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

// ── Projects ──────────────────────────────────────────────────────────────────

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

export type ProjectThread = {
  id: string
  projectId: string
  title: string
  eveSessionId: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export type ProjectItem = {
  id: string
  projectId: string
  kind: "skill" | "mcp" | "plugin"
  slug: string | null
  name: string | null
  enabled: boolean
  bodyMarkdown: string | null
  mcpUrl: string | null
  catalogItemId: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectDetail = Project & {
  threads: ProjectThread[]
  items?: ProjectItem[]
}

export type CatalogKind = "skill" | "mcp" | "plugin"

export type CatalogItem = {
  id: string
  kind: CatalogKind
  slug: string
  name: string | null
  description: string | null
  mcpUrl: string | null
  authKind: string | null
  defaultEnabled: boolean
}

export type RecentChat = {
  id: string
  title: string
  scope: "workspace" | "project"
  parentId: string
  parentName: string
  updatedAt: string
}

export type WorkspaceThread = {
  id: string
  workspaceId: string
  title: string
  eveSessionId: string | null
  status: string
  createdAt: string
  updatedAt: string
}

// ── Organization ──────────────────────────────────────────────────────────────

export type OrganizationMember = {
  id: string
  userId: string
  role: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
}

export type OrganizationInvitation = {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
  inviterId: string
  organizationId: string
}

export type Organization = {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: string
  metadata: Record<string, unknown> | null
}

export type OrganizationFull = Organization & {
  members: OrganizationMember[]
  invitations: OrganizationInvitation[]
}

// ── Transactions ──────────────────────────────────────────────────────────────

export type Transaction = {
  id: string
  workspaceId: string
  amount: number
  reason: string | null
  actorId: string | null
  projectId: string | null
  createdAt: string
}

export type TransactionPage = {
  transactions: Transaction[]
  total: number
  limit: number
  offset: number
}
