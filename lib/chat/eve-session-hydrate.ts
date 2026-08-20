import { Client } from "eve/client"
import type { ClientSessionState, MessageStreamEvent } from "eve/client"

export type HydratedEveSession = {
  events: readonly MessageStreamEvent[]
  session: ClientSessionState
}

export async function hydrateEveSession(
  sessionId: string
): Promise<HydratedEveSession> {
  const client = new Client({ host: "" })
  const session = client.sessions.attach(sessionId)
  return session.snapshot()
}
