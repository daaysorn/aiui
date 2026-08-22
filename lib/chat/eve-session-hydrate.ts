import { Client } from "eve/client"
import type { ClientSessionState, MessageStreamEvent } from "eve/client"

export type HydratedEveSession = {
  events: readonly MessageStreamEvent[]
  session: ClientSessionState
}

type HydrateOptions = {
  timeoutMs?: number
}

export async function hydrateEveSession(
  sessionId: string,
  options: HydrateOptions = {}
): Promise<HydratedEveSession> {
  const timeoutMs = options.timeoutMs ?? 8_000
  const client = new Client({ host: "" })
  const session = client.sessions.attach(sessionId)

  const snapshot = session.snapshot()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      snapshot,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Eve session hydrate timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
