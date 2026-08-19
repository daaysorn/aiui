"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Lottie } from "lottie-react"

import { cn } from "@/lib/utils"

const BRAND_CYCLE_SOURCES = [
  "/lottie/wink.json",
  "/lottie/head-shake.json",
  "/lottie/face-in-clouds.json",
] as const

const GREETING_SOURCES = {
  morning: "/lottie/greeting-morning.json",
  afternoon: "/lottie/greeting-afternoon.json",
  evening: "/lottie/greeting-evening.json",
} as const

export type GreetingPeriod = keyof typeof GREETING_SOURCES

export function greetingPeriod(now = new Date()): GreetingPeriod {
  const hour = now.getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

const HOLD_MS = 700
const FADE_MS = 550

const animationCache = new Map<string, Promise<object>>()

function loadAnimation(src: string) {
  let pending = animationCache.get(src)
  if (!pending) {
    pending = fetch(src).then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load ${src}`)
      }
      return response.json() as Promise<object>
    })
    animationCache.set(src, pending)
  }

  return pending.then((data) => JSON.parse(JSON.stringify(data)) as object)
}

function BrandEmojiCycle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [layer, setLayer] = useState<{ id: number; data: object } | null>(null)
  const [previous, setPrevious] = useState<object | null>(null)
  const [currentReady, setCurrentReady] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const reduceMotionRef = useRef(false)
  const indexRef = useRef(0)
  const layerRef = useRef<{ id: number; data: object } | null>(null)
  const previousRef = useRef<object | null>(null)
  const cycleRef = useRef(0)
  const nextIdRef = useRef(1)

  layerRef.current = layer
  previousRef.current = previous

  useEffect(() => {
    setMounted(true)
    void Promise.all(BRAND_CYCLE_SOURCES.map((src) => loadAnimation(src)))
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      reduceMotionRef.current = media.matches
      setReduceMotion(media.matches)
    }
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!mounted) return
    void loadAnimation(BRAND_CYCLE_SOURCES[0]).then((data) => {
      setLayer({ id: 0, data })
      setCurrentReady(false)
    })
  }, [mounted])

  const subscriptions = useMemo(
    () => ({
      ready: () => {
        setCurrentReady(true)
        if (!previousRef.current) return
        window.setTimeout(() => setPrevious(null), FADE_MS)
      },
      complete: () => {
        if (reduceMotionRef.current) return
        const cycle = ++cycleRef.current
        window.setTimeout(() => {
          if (cycle !== cycleRef.current) return
          const nextIndex = (indexRef.current + 1) % BRAND_CYCLE_SOURCES.length
          void loadAnimation(BRAND_CYCLE_SOURCES[nextIndex]).then((data) => {
            if (cycle !== cycleRef.current) return
            setPrevious(layerRef.current?.data ?? null)
            indexRef.current = nextIndex
            setLayer({ id: nextIdRef.current++, data })
            setCurrentReady(false)
          })
        }, HOLD_MS)
      },
    }),
    []
  )

  return (
    <span
      className={cn(
        "pointer-events-none relative size-7 shrink-0 overflow-hidden contain-[size]",
        className
      )}
      aria-hidden
    >
      {previous ? (
        <Lottie
          as="span"
          src={previous}
          autoplay={false}
          loop={false}
          className={cn(
            "absolute inset-0 block size-full min-h-0 min-w-0 bg-transparent will-change-[opacity] transition-opacity duration-550 ease-in-out [&_svg]:block [&_svg]:size-full [&_svg]:bg-transparent",
            currentReady ? "opacity-0" : "opacity-100"
          )}
        />
      ) : null}
      {layer ? (
        <Lottie
          key={layer.id}
          as="span"
          src={layer.data}
          autoplay={!reduceMotion}
          loop={false}
          subscriptions={subscriptions}
          className={cn(
            "absolute inset-0 block size-full min-h-0 min-w-0 bg-transparent will-change-[opacity] transition-opacity duration-550 ease-in-out [&_svg]:block [&_svg]:size-full [&_svg]:bg-transparent",
            currentReady || !previous ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}
    </span>
  )
}

function GreetingEmoji({ className }: { className?: string }) {
  const [period, setPeriod] = useState<GreetingPeriod | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setPeriod(greetingPeriod())
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return (
    <span
      className={cn(
        "relative size-7 shrink-0 overflow-hidden contain-[size]",
        className
      )}
      aria-hidden
    >
      {period ? (
        <Lottie
          as="span"
          src={GREETING_SOURCES[period]}
          autoplay={!reduceMotion}
          loop={false}
          className="absolute inset-0 block size-full min-h-0 min-w-0 bg-transparent [&_svg]:block [&_svg]:size-full [&_svg]:bg-transparent"
        />
      ) : null}
    </span>
  )
}

export { BrandEmojiCycle, GreetingEmoji }
