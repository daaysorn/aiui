const STORAGE_KEY = "aiui:sound-notifications"
const CHANGE_EVENT = "aiui:sound-notifications"

function isSoundNotificationsEnabled() {
  if (typeof window === "undefined") return true
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === null) return true
  return stored === "1"
}

function setSoundNotificationsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0")
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribeSoundNotifications(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}

  const onChange = () => onStoreChange()
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

export {
  isSoundNotificationsEnabled,
  setSoundNotificationsEnabled,
  subscribeSoundNotifications,
}
