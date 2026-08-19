"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Lottie, type LottieHandle } from "lottie-react"

import { cn } from "@/lib/utils"

export type ChatEmojiMood =
  | "default"
  | "thinking"
  | "searching"
  | "sad"
  | "confused"

const CHAT_EMOJI_SOURCES: Record<ChatEmojiMood, string | readonly string[]> = {
  default: "/lottie/wink.json",
  thinking: ["/lottie/thinking.json", "/lottie/head-shake.json"],
  searching: "/lottie/face-in-clouds.json",
  sad: "/lottie/sad.json",
  confused: "/lottie/confused.json",
}

const CHAT_EMOJI_LABEL: Record<ChatEmojiMood, string> = {
  default: "daaybot",
  thinking: "Thinking",
  searching: "Searching",
  sad: "Sad",
  confused: "Confused",
}

function ChatEmoji({
  mood = "default",
  className,
}: {
  mood?: ChatEmojiMood
  className?: string
}) {
  const lottieRef = useRef<LottieHandle>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [cycleIndex, setCycleIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotionRef = useRef(false)
  const pausedRef = useRef(false)

  pausedRef.current = paused

  const sources = CHAT_EMOJI_SOURCES[mood]
  const playlist = Array.isArray(sources) ? sources : [sources]
  const src = playlist[cycleIndex % playlist.length]
  const cycling = playlist.length > 1 && !reduceMotion

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
    setCycleIndex(0)
    setPaused(false)
  }, [mood])

  useEffect(() => {
    if (!reduceMotion) return
    lottieRef.current?.pause()
  }, [reduceMotion])

  const subscriptions = useMemo(
    () => ({
      complete: () => {
        if (reduceMotionRef.current || pausedRef.current) return
        if (cycling) {
          setCycleIndex((i) => i + 1)
          return
        }
        const lottie = lottieRef.current
        if (!lottie) return
        lottie.stop()
        lottie.play()
      },
    }),
    [cycling]
  )

  const label = CHAT_EMOJI_LABEL[mood]

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
        "relative isolate size-8 shrink-0 overflow-hidden bg-transparent p-0 contain-[strict]",
        className
      )}
      aria-label={paused ? `Play ${label}` : `Pause ${label}`}
      aria-pressed={paused}
      onClick={togglePlayback}
    >
      <Lottie
        key={`${mood}-${src}`}
        as="span"
        src={src}
        lottieRef={lottieRef}
        autoplay={!reduceMotion}
        loop={false}
        subscriptions={subscriptions}
        className="pointer-events-none absolute inset-0 block size-full min-h-0 min-w-0 [&_svg]:block [&_svg]:size-full"
      />
    </button>
  )
}

export { ChatEmoji, CHAT_EMOJI_SOURCES }
