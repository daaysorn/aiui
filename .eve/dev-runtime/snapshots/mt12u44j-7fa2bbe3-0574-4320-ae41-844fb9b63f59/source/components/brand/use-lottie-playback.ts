import { useCallback, useEffect, useRef, type RefObject } from "react"

import type { LottieHandle } from "lottie-react"

export function usePlaybackGate(shouldPlay: boolean) {
  const shouldPlayRef = useRef(shouldPlay)
  shouldPlayRef.current = shouldPlay

  const playIfAllowed = useCallback((lottie: LottieHandle | null) => {
    if (shouldPlayRef.current) {
      lottie?.play()
    }
  }, [])

  return playIfAllowed
}

export function useLottiePlaybackSync(
  lottieRef: RefObject<LottieHandle | null>,
  shouldPlay: boolean
) {
  useEffect(() => {
    const lottie = lottieRef.current
    if (!lottie) return
    if (shouldPlay) {
      lottie.play()
      return
    }
    lottie.pause()
  }, [lottieRef, shouldPlay])
}
