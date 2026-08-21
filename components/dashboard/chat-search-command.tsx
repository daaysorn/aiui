"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRecentChats } from "@/hooks/use-dashboard-query"
import {
  DASHBOARD_NEW_CHAT_EVENT,
  DASHBOARD_SEARCH_CHATS_EVENT,
  recentChatHref,
} from "@/lib/chat/thread-title"

type ChatSearchCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ChatSearchCommand({ open, onOpenChange }: ChatSearchCommandProps) {
  const router = useRouter()
  const { data: recents } = useRecentChats()
  const chats = recents ?? []

  function go(href: string) {
    onOpenChange(false)
    router.push(href)
  }

  function startNewChat() {
    onOpenChange(false)
    window.dispatchEvent(new Event(DASHBOARD_NEW_CHAT_EVENT))
    router.push("/dashboard")
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search chats"
      description="Find a past chat or start a new one."
    >
      <CommandInput placeholder="Search chats..." />
      <CommandList>
        <CommandEmpty>No matching chats.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem value="new chat" onSelect={startNewChat}>
            <ChatIcon />
            <span>New chat</span>
          </CommandItem>
        </CommandGroup>
        {chats.length > 0 ? (
          <CommandGroup heading="Recents">
            {chats.map((chat) => (
              <CommandItem
                key={`${chat.scope}:${chat.id}`}
                value={`${chat.title} ${chat.parentName}`}
                onSelect={() => go(recentChatHref(chat))}
              >
                <MagnifyingGlassIcon />
                <span className="min-w-0 truncate">{chat.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  )
}

function useChatSearchOpen() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return
      if (!(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      setOpen((current) => !current)
    }

    function onOpenSearch() {
      setOpen(true)
    }

    document.addEventListener("keydown", onKeyDown)
    window.addEventListener(DASHBOARD_SEARCH_CHATS_EVENT, onOpenSearch)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener(DASHBOARD_SEARCH_CHATS_EVENT, onOpenSearch)
    }
  }, [])

  return { open, setOpen }
}

export { ChatSearchCommand, useChatSearchOpen }
