"use client"

import { type FormEvent, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { DashboardSection } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createLocalChannel } from "@/lib/channels-store"
import { queryKeys } from "@/lib/query/keys"

export function NewChannelView() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get("name") ?? "").trim()
    if (!name) return
    setPending(true)
    const channel = createLocalChannel(name)
    void queryClient.invalidateQueries({ queryKey: queryKeys.channels })
    router.push(`/dashboard/channels/${channel.id}`)
  }

  return (
    <DashboardSection
      title="New channel"
      description="Name the new channel."
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-xl flex flex-col gap-4 rounded-xl bg-card p-6"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Channel name
          </label>
          <Input id="name" name="name" required maxLength={120} />
        </div>
        <Button type="submit" loading={pending}>
          Create channel
        </Button>
      </form>
    </DashboardSection>
  )
}
