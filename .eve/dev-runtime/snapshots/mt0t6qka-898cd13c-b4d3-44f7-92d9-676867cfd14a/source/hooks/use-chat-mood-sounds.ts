"use client"

import { useEffect, useRef } from "react"

import type { ChatEmojiMood } from "@/components/brand/chat-emoji"
import { playMoodCue, startMoodLoop, stopMoodLoop } from "@/lib/chat-sounds"
import { useSoundNotifications } from "@/hooks/use-sound-notifications"

function isLoopMood(mood: ChatEmojiMood): mood is "thinking" | "searching" {
  return mood === "thinking" || mood === "searching"
}

function useChatMoodSounds(mood: ChatEmojiMood) {
  const enabled = useSoundNotifications()
  const previousMood = useRef<ChatEmojiMood | null>(null)

  useEffect(() => {
    if (!enabled) {
      stopMoodLoop()
      previousMood.current = mood
      return
    }

    if (isLoopMood(mood)) startMoodLoop(mood)
    else stopMoodLoop()

    const from = previousMood.current
    previousMood.current = mood
    if (from === null) return

    if (mood === "sad" || mood === "confused") playMoodCue(mood)
    if (isLoopMood(from) && !isLoopMood(mood)) playMoodCue("complete")
  }, [mood, enabled])

  useEffect(() => () => stopMoodLoop(), [])
}

export { useChatMoodSounds }
