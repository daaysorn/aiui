"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Lottie } from "lottie-react"

import { cn } from "@/lib/utils"

const EMOJI_SOURCES = [
  "/lottie/wink.json",
  "/lottie/head-shake.json",
  "/lottie/face-in-clouds.json",
] as const

const HOLD_MS = 700
const FADE_MS = 550

type EmojiLayer = {
  key: number
  index: number
}

function BrandEmojiCycle({ className }: { className?: string }) {
  const [stack, setStack] = useState<EmojiLayer[]>([{ key: 0, index: 0 }])
  const [activeKey, setActiveKey] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const reduceMotionRef = useRef(false)
  const activeKeyRef = useRef(0)
  const cycleRef = useRef(0)
  const nextKeyRef = useRef(1)

  activeKeyRef.current = activeKey

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

  function handleComplete() {
    if (reduceMotionRef.current) return

    const cycle = ++cycleRef.current
    const nextKey = nextKeyRef.current++

    window.setTimeout(() => {
      if (cycle !== cycleRef.current) return

      setStack((layers) => {
        const current =
          layers.find((layer) => layer.key === activeKeyRef.current) ??
          layers[layers.length - 1]
        const nextIndex = ((current?.index ?? 0) + 1) % EMOJI_SOURCES.length
        return [...layers, { key: nextKey, index: nextIndex }]
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cycle !== cycleRef.current) return
          setActiveKey(nextKey)
        })
      })

      window.setTimeout(() => {
        if (cycle !== cycleRef.current) return
        setStack((layers) => layers.filter((layer) => layer.key === nextKey))
      }, FADE_MS)
    }, HOLD_MS)
  }

  return (
    <span
      className={cn(
        "relative size-7 shrink-0 overflow-hidden contain-[size]",
        className
      )}
      aria-hidden
    >
      {stack.map((layer) => (
        <EmojiLayer
          key={layer.key}
          src={EMOJI_SOURCES[layer.index]}
          active={layer.key === activeKey}
          autoplay={!reduceMotion}
          onComplete={
            !reduceMotion && layer.key === activeKey ? handleComplete : undefined
          }
        />
      ))}
    </span>
  )
}

function EmojiLayer({
  src,
  active,
  autoplay,
  onComplete,
}: {
  src: string
  active: boolean
  autoplay: boolean
  onComplete?: () => void
}) {
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const subscriptions = useMemo(
    () =>
      onComplete
        ? {
            complete: () => onCompleteRef.current?.(),
          }
        : undefined,
    [Boolean(onComplete)]
  )

  return (
    <Lottie
      as="span"
      src={src}
      autoplay={autoplay}
      loop={false}
      subscriptions={subscriptions}
      className={cn(
        "absolute inset-0 block size-full min-h-0 min-w-0 will-change-[opacity] transition-opacity duration-550 ease-in-out [&_svg]:block [&_svg]:size-full",
        active ? "opacity-100" : "opacity-0"
      )}
    />
  )
}

export { BrandEmojiCycle }
