export const queryKeys = {
  overview: ["user-overview"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
}
