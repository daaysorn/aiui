"use client"

import { useEffect, useMemo, useRef } from "react"
import { Lottie, type LottieHandle } from "lottie-react"

import {
  useLottiePlaybackSync,
  usePlaybackGate,
} from "@/components/brand/use-lottie-playback"
import { sidebarBotEmoji } from "@/components/brand/lottie-data"
import { cn } from "@/lib/utils"

function SidebarBotIcon({ className }: { className?: string }) {
  const lottieRef = useRef<LottieHandle>(null)
  const playIfAllowed = usePlaybackGate(true)

  useLottiePlaybackSync(lottieRef, true)

  const subscriptions = useMemo(
    () => ({
      ready: () => {
        playIfAllowed(lottieRef.current)
      },
      complete: () => {
        lottieRef.current?.stop()
        lottieRef.current?.play()
      },
    }),
    [playIfAllowed]
  )

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => {
      if (media.matches) {
        lottieRef.current?.pause()
        return
      }
      lottieRef.current?.play()
    }
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return (
    <span
      className={cn("relative size-4 shrink-0 overflow-hidden", className)}
      aria-hidden
    >
      <Lottie
        as="span"
        src={sidebarBotEmoji}
        lottieRef={lottieRef}
        autoplay={false}
        loop={false}
        subscriptions={subscriptions}
        className="pointer-events-none absolute inset-0 block size-full min-h-0 min-w-0 [&_svg]:block [&_svg]:size-full"
      />
    </span>
  )
}

export { SidebarBotIcon }
