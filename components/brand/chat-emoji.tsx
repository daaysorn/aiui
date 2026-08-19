"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Lottie } from "lottie-react"

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
  const [reduceMotion, setReduceMotion] = useState(false)
  const [cycleIndex, setCycleIndex] = useState(0)
  const reduceMotionRef = useRef(false)

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
  }, [mood])

  const subscriptions = useMemo(
    () =>
      cycling
        ? {
            complete: () => {
              if (reduceMotionRef.current) return
              setCycleIndex((i) => i + 1)
            },
          }
        : undefined,
    [cycling]
  )

  return (
    <span
      className={cn("relative size-8 shrink-0 overflow-hidden contain-[size]", className)}
      aria-label={CHAT_EMOJI_LABEL[mood]}
      role="img"
    >
      <Lottie
        key={`${mood}-${src}`}
        as="span"
        src={src}
        autoplay={!reduceMotion}
        loop={!cycling && !reduceMotion}
        subscriptions={subscriptions}
        className="absolute inset-0 block size-full min-h-0 min-w-0 [&_svg]:block [&_svg]:size-full"
      />
    </span>
  )
}

export { ChatEmoji, CHAT_EMOJI_SOURCES }
