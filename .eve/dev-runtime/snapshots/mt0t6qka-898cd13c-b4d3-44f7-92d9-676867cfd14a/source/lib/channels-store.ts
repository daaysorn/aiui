export type LocalChannel = {
  id: string
  name: string
  createdAt: string
}

const STORAGE_KEY = "aiui_channels"

function readChannels(): LocalChannel[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalChannel[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeChannels(channels: LocalChannel[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(channels))
}

export function listLocalChannels(): LocalChannel[] {
  return readChannels().slice().sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

export function getLocalChannel(id: string): LocalChannel | null {
  return readChannels().find((channel) => channel.id === id) ?? null
}

export function createLocalChannel(name: string): LocalChannel {
  const channel: LocalChannel = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  }
  writeChannels([channel, ...readChannels()])
  return channel
}
