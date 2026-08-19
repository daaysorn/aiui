"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useSyncExternalStore } from "react"

import { getTurnstileSiteKey } from "@/lib/site"

type TurnstileFieldProps = {
  onChange: (token: string | null) => void
  resetKey?: number
}

type TurnstileApi = {
  render: (
    container: HTMLElement | string,
    options: {
      sitekey: string
      theme?: "light" | "dark" | "auto"
      size?: "normal" | "flexible" | "compact"
      callback?: (token: string) => void
      "error-callback"?: (errorCode: string) => void
      "expired-callback"?: () => void
    }
  ) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]`
  )

  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve(window.turnstile)
        return
      }

      const onLoad = () => {
        if (window.turnstile) resolve(window.turnstile)
        else reject(new Error("Turnstile failed to load."))
      }

      existing.addEventListener("load", onLoad)
      existing.addEventListener("error", () =>
        reject(new Error("Turnstile script error."))
      )
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener("load", () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error("Turnstile failed to load."))
    })
    script.addEventListener("error", () =>
      reject(new Error("Turnstile script error."))
    )
    document.head.appendChild(script)
  })
}

function TurnstileField({ onChange, resetKey = 0 }: TurnstileFieldProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const onChangeRef = useRef(onChange)
  const lastResetKeyRef = useRef(resetKey)
  const turnstileTheme = resolvedTheme === "light" ? "light" : "dark"

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!mounted) {
      return
    }

    let cancelled = false

    async function mount() {
      if (!containerRef.current) return

      try {
        const turnstile = await loadTurnstileScript()
        if (cancelled || !containerRef.current) {
          return
        }

        if (widgetIdRef.current) {
          turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = undefined
          containerRef.current.innerHTML = ""
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: getTurnstileSiteKey(),
          theme: turnstileTheme,
          size: "flexible",
          callback: (token) => onChangeRef.current(token),
          "expired-callback": () => onChangeRef.current(null),
          "error-callback": () => onChangeRef.current(null),
        })
      } catch {
        if (!cancelled) onChangeRef.current(null)
      }
    }

    void mount()

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = undefined
      }
      onChangeRef.current(null)
    }
  }, [mounted, turnstileTheme])

  useEffect(() => {
    if (lastResetKeyRef.current === resetKey) return
    lastResetKeyRef.current = resetKey
    if (!widgetIdRef.current || !window.turnstile) return
    window.turnstile.reset(widgetIdRef.current)
    onChangeRef.current(null)
  }, [resetKey])

  return <div ref={containerRef} className="w-full min-w-0" />
}

export { TurnstileField }
