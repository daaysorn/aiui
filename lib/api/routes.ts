/**
 * Backend API route reference for the frontend.
 *
 * All routes are prefixed with the API base URL (`NEXT_PUBLIC_API_URL`).
 * Every authenticated route requires `Authorization: Bearer <token>`.
 * All responses use the envelope: `{ statusCode, statusType, message, data? }`.
 *
 * --- Auth (Better Auth) (/v1/auth/*) ---
 * POST /v1/auth/sign-up/email         { email, name, password }
 * POST /v1/auth/sign-in/email         { email, password }
 * POST /v1/auth/sign-in/username      { username, password }
 * GET  /v1/auth/sign-out
 * GET  /v1/auth/get-session           → rewritten to /v1/user/me by apiFetch
 * POST /v1/auth/forget/password       { email, redirectTo }
 * POST /v1/auth/reset/password        { token, newPassword }
 * POST /v1/auth/email-otp/send-verification-otp  { email, type: "email-verification" }
 * POST /v1/auth/email-otp/verify-email            { email, otp }
 * GET  /v1/auth/callback/{provider}               OAuth redirect endpoint
 * POST /v1/auth/sign-in/social        { provider: "google"|"github", callbackURL, ... }
 *
 * After OAuth completes, Bearer token is appended to callbackURL as ?token=…
 *
 * --- User (/v1/user/*) ---
 * GET    /v1/user/me                  → { user: SessionUser }
 * GET    /v1/user/overview            → UserOverview
 * PATCH  /v1/user/profile             { name?, image?, username?, telephone? }
 * POST   /v1/user/onboarding          { username, telephone }
 * GET    /v1/user/sessions            → list of active sessions
 * DELETE /v1/user/sessions            ?mode=others|all
 * POST   /v1/user/two-factor/enable   { password?, issuer? }
 * POST   /v1/user/two-factor/disable  { code }
 * GET    /v1/user/two-factor/setup    → { totpURI }
 * POST   /v1/user/two-factor/verify   { code }
 * POST   /v1/user/change-password     { currentPassword, newPassword, revokeOtherSessions? }
 * PATCH  /v1/user/password            { currentPassword, newPassword, revokeOtherSessions? }
 * DELETE /v1/user/account             { password? }
 * GET    /v1/user/accounts            → linked OAuth accounts
 * POST   /v1/user/accounts/link       { provider, callbackURL? }
 * DELETE /v1/user/accounts/{provider}
 * GET    /v1/user/check/username?username=…  → { available: boolean }
 * GET    /v1/user/check/telephone?telephone=…
 *
 * --- Billing (/v1/billing/*) ---
 * GET    /v1/billing/plans            ?audience=personal|organization → { plans: BillingPlan[] }
 * GET    /v1/billing/plans/:slug      → BillingPlan
 * GET    /v1/billing/gateway          → { provider, model, configured, ready } (public policy)
 * GET    /v1/internal/eve/gateway     → { provider, model, baseUrl, apiKey } (server-only; Bearer EVE_GATEWAY_INTERNAL_TOKEN)
 * POST   /v1/billing/customer         Ensure Autumn customer exists
 * POST   /v1/billing/check            { featureId, requiredBalance? } → { allowed, balance? }
 * POST   /v1/billing/track             { featureId, value? } → usage recorded
 * POST   /v1/billing/attach            { planId, organizationId?, seats? } → { paymentUrl? }
 * GET    /v1/billing/usage            → BillingUsage
 * PATCH  /v1/billing/extra-usage      { enabled, capCents? }
 * POST   /v1/billing/extra-usage/funds { amountCents }
 * GET    /v1/billing/subscription     → CustomerBillingView
 * GET    /v1/billing/payment-method   → { paymentMethod, autoCharge }
 * POST   /v1/billing/portal           { returnUrl? } → { url }
 * POST   /v1/billing/setup-payment    { returnUrl? } → { url }
 *
 * --- Projects (/v1/projects/*) ---
 * POST   /v1/projects                 { name, brief? } → Project
 * GET    /v1/projects                 → { projects: Project[] }
 * GET    /v1/projects/:id             → ProjectDetail
 * PATCH  /v1/projects/:id             { name?, brief? }
 * POST   /v1/projects/:id/build       { message? } → build authorization
 * GET    /v1/projects/:id/instructions → { markdown }
 * PATCH  /v1/projects/:id/instructions { markdown }
 * GET    /v1/projects/:id/items       ?kind=skill|mcp|plugin → { items: ProjectItem[] }
 * POST   /v1/projects/:id/items       { kind, slug?, name?, enabled?, bodyMarkdown?, mcpUrl? }
 * PATCH  /v1/projects/:id/items/:itemId { enabled?, bodyMarkdown?, mcpUrl? }
 * DELETE /v1/projects/:id/items/:itemId
 * GET    /v1/projects/:id/runtime     → merged Eve runtime config
 * GET    /v1/projects/:id/threads     → { threads: ProjectThread[] }
 * POST   /v1/projects/:id/threads     { title }
 * GET    /v1/projects/:id/threads/:threadId → ProjectThread
 * PATCH  /v1/projects/:id/threads/:threadId { title?, eveSessionId?, status? }
 *
 * --- Catalog (/v1/catalog/*) ---
 * GET    /v1/catalog                  ?kind=skill|mcp|plugin → { items: CatalogItem[] }
 *
 * --- Workspace settings (/v1/workspace/*) ---
 * GET    /v1/workspace/capabilities   ?kind=… → { items: WorkspaceItem[] }
 * PATCH  /v1/workspace/capabilities   { items: [{ catalogItemId, enabled, bodyMarkdown?, mcpUrl? }] }
 *
 * --- Organizations (/v1/organisations/*) ---
 * POST   /v1/organisations            { name, slug?, logo? }
 * GET    /v1/organisations/:slug      → OrganizationFull
 * PATCH  /v1/organisations/:slug      { name?, logo? }
 * DELETE /v1/organisations/:slug
 * POST   /v1/organisations/:slug/invite     { email, role }
 * GET    /v1/organisations/:slug/invitations → { invitations: OrganizationInvitation[] }
 * DELETE /v1/organisations/:slug/invitations/:id
 * GET    /v1/organisations/:slug/members     → { members: OrganizationMember[] }
 * PATCH  /v1/organisations/:slug/members/:id { role }
 * DELETE /v1/organisations/:slug/members/:id
 * POST   /v1/organisations/:slug/leave
 *
 * --- Transactions (/v1/transactions/*) ---
 * GET    /v1/transactions             ?page=1&pageSize=20 → TransactionPage
 * GET    /v1/transactions/export      → CSV download
 *
 * --- Misc (/v1/misc/*) ---
 * POST   /v1/misc/webhooks/autumn     Autumn payment webhook receiver
 *
 * --- Health (/health) ---
 * GET    /health                      liveness → { status: "ok" }
 * GET    /health/ready                readiness (DB, Redis)
 */

// Re-export all types for convenience
export type {
  BillingPlan,
  BillingUsage,
  CustomerBillingView,
  Organization,
  OrganizationFull,
  OrganizationInvitation,
  OrganizationMember,
  OverviewWorkspace,
  Project,
  ProjectDetail,
  ProjectItem,
  ProjectThread,
  PublicPaymentMethod,
  LinkedAccount,
  UserSession,
  SessionUser,
  Transaction,
  TransactionPage,
  UserOverview,
} from "@/lib/api/types"
