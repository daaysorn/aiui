export const queryKeys = {
  overview: ["user-overview"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  billingPlans: ["billing-plans"] as const,
  catalog: (kind: string) => ["catalog", kind] as const,
  recentChats: ["recent-chats"] as const,
}
