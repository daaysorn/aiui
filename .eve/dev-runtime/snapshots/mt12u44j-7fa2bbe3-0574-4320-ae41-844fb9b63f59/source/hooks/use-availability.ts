"use client"

import { useEffect, useRef, useState } from "react"

type Status = "idle" | "checking" | "available" | "taken" | "error"

type CheckFn = (value: string) => Promise<{ ok: boolean; envelope: { data?: { available?: boolean } } }>

type Options = {
  check: CheckFn
  minLength?: number
  debounceMs?: number
}

function useAvailability(value: string, { check, minLength = 1, debounceMs = 500 }: Options) {
  const [status, setStatus] = useState<Status>("idle")
  const checkRef = useRef(check)
  checkRef.current = check

  useEffect(() => {
    const trimmed = value.trim()

    if (trimmed.length < minLength) {
      setStatus("idle")
      return
    }

    setStatus("checking")

    const timeout = window.setTimeout(async () => {
      try {
        const result = await checkRef.current(trimmed)
        if (!result.ok) {
          setStatus("error")
        } else if (result.envelope.data?.available === true) {
          setStatus("available")
        } else if (result.envelope.data?.available === false) {
          setStatus("taken")
        } else {
          setStatus("error")
        }
      } catch {
        setStatus("error")
      }
    }, debounceMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [value, minLength, debounceMs])

  return status
}

export { useAvailability, type Status }
