"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Lottie, type LottieHandle } from "lottie-react"

import {
  brandLogoEmoji,
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

function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return reduceMotion
}

function BrandEmojiCycle({ className }: { className?: string }) {
  const lottieRef = useRef<LottieHandle>(null)
  const reduceMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)

  const shouldPlay = !reduceMotion && !paused
  const playIfAllowed = usePlaybackGate(shouldPlay)

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
      <Lottie
        as="span"
        src={brandLogoEmoji}
        lottieRef={lottieRef}
        autoplay={false}
        loop={!reduceMotion && !paused}
        subscriptions={subscriptions}
        className="pointer-events-none absolute inset-0 block size-full min-h-0 min-w-0 bg-transparent [&_svg]:block [&_svg]:size-full [&_svg]:bg-transparent"
      />
    </button>
  )
}

function GreetingEmoji({ className }: { className?: string }) {
  const lottieRef = useRef<LottieHandle>(null)
  const reduceMotion = useReducedMotion()
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
