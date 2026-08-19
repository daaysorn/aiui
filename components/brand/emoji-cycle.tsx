"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Lottie, type LottieHandle } from "lottie-react"

import {
  brandCycleEmojis,
  greetingEmojis,
} from "@/components/brand/lottie-data"
import {
  useLottiePlaybackSync,
  usePlaybackGate,
} from "@/components/brand/use-lottie-playback"
import { cn } from "@/lib/utils"

const GREETING_SOURCES = greetingEmojis

export type GreetingPeriod = keyof typeof GREETING_SOURCES

export function greetingPeriod(now = new Date()): GreetingPeriod {
  const hour = now.getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

const HOLD_MS = 700
const FADE_MS = 550

function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false)
  const reduceMotionRef = useRef(false)

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

  return { reduceMotion, reduceMotionRef }
}

function BrandEmojiCycle({ className }: { className?: string }) {
  const lottieRef = useRef<LottieHandle>(null)
  const { reduceMotion, reduceMotionRef } = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  const [layer, setLayer] = useState<{ id: number; data: object } | null>(null)
  const [previous, setPrevious] = useState<object | null>(null)
  const [currentReady, setCurrentReady] = useState(false)

  const indexRef = useRef(0)
  const layerRef = useRef<{ id: number; data: object } | null>(null)
  const previousRef = useRef<object | null>(null)
  const cycleRef = useRef(0)
  const nextIdRef = useRef(1)

  const shouldPlay = !reduceMotion && !paused
  const playIfAllowed = usePlaybackGate(shouldPlay)

  pausedRef.current = paused
  layerRef.current = layer
  previousRef.current = previous

  useLottiePlaybackSync(lottieRef, shouldPlay && Boolean(layer))

  useEffect(() => {
    setLayer({ id: 0, data: brandCycleEmojis[0] })
    setCurrentReady(false)
  }, [])

  const subscriptions = useMemo(
    () => ({
      ready: () => {
        playIfAllowed(lottieRef.current)
        setCurrentReady(true)
        if (!previousRef.current) return
        window.setTimeout(() => setPrevious(null), FADE_MS)
      },
      complete: () => {
        if (reduceMotionRef.current || pausedRef.current) return
        const cycle = ++cycleRef.current
        window.setTimeout(() => {
          if (cycle !== cycleRef.current) return
          const nextIndex = (indexRef.current + 1) % brandCycleEmojis.length
          const data = brandCycleEmojis[nextIndex]
          if (cycle !== cycleRef.current) return
          setPrevious(layerRef.current?.data ?? null)
          indexRef.current = nextIndex
          setLayer({ id: nextIdRef.current++, data })
          setCurrentReady(false)
        }, HOLD_MS)
      },
    }),
    [playIfAllowed, reduceMotionRef]
  )

  function togglePlayback() {
    const lottie = lottieRef.current
    if (paused) {
      setPaused(false)
      lottie?.play()
      return
    }
    setPaused(true)
    lottie?.pause()
  }

  return (
    <button
      type="button"
      className={cn(
        "relative isolate size-7 shrink-0 overflow-hidden bg-transparent p-0 contain-[size]",
        className
      )}
      aria-label={paused ? "Play daaybot" : "Pause daaybot"}
      aria-pressed={paused}
      onClick={togglePlayback}
    >
      {previous ? (
        <Lottie
          as="span"
          src={previous}
          autoplay={false}
          loop={false}
          className={cn(
            "pointer-events-none absolute inset-0 block size-full min-h-0 min-w-0 bg-transparent will-change-[opacity] transition-opacity duration-550 ease-in-out [&_svg]:block [&_svg]:size-full [&_svg]:bg-transparent",
            currentReady ? "opacity-0" : "opacity-100"
          )}
        />
      ) : null}
      {layer ? (
        <Lottie
          key={layer.id}
          as="span"
          src={layer.data}
          lottieRef={lottieRef}
          autoplay={false}
          loop={false}
          subscriptions={subscriptions}
          className={cn(
            "pointer-events-none absolute inset-0 block size-full min-h-0 min-w-0 bg-transparent will-change-[opacity] transition-opacity duration-550 ease-in-out [&_svg]:block [&_svg]:size-full [&_svg]:bg-transparent",
            currentReady || !previous ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}
    </button>
  )
}

function GreetingEmoji({ className }: { className?: string }) {
  const lottieRef = useRef<LottieHandle>(null)
  const { reduceMotion } = useReducedMotion()
  const [period, setPeriod] = useState<GreetingPeriod | null>(null)
  const [paused, setPaused] = useState(false)

  const data = period ? GREETING_SOURCES[period] : null
  const shouldPlay = Boolean(data) && !reduceMotion && !paused
  const playIfAllowed = usePlaybackGate(shouldPlay)

  useEffect(() => {
    setPeriod(greetingPeriod())
  }, [])

  useLottiePlaybackSync(lottieRef, shouldPlay)

  const subscriptions = useMemo(
    () => ({
      ready: () => {
        playIfAllowed(lottieRef.current)
      },
    }),
    [playIfAllowed]
  )

  function togglePlayback() {
    const lottie = lottieRef.current
    if (paused) {
      setPaused(false)
      lottie?.play()
      return
    }
    setPaused(true)
    lottie?.pause()
  }

  const label = period ?? "daaybot"

  return (
    <button
      type="button"
      className={cn(
        "relative isolate size-7 shrink-0 overflow-hidden bg-transparent p-0 contain-[size]",
        className
      )}
      aria-label={paused ? `Play ${label}` : `Pause ${label}`}
      aria-pressed={paused}
      onClick={togglePlayback}
    >
      {data ? (
        <Lottie
          as="span"
          src={data}
          lottieRef={lottieRef}
          autoplay={false}
          loop={!reduceMotion && !paused}
          subscriptions={subscriptions}
          className="pointer-events-none absolute inset-0 block size-full min-h-0 min-w-0 bg-transparent [&_svg]:block [&_svg]:size-full [&_svg]:bg-transparent"
        />
      ) : null}
    </button>
  )
}

export { BrandEmojiCycle, GreetingEmoji }
