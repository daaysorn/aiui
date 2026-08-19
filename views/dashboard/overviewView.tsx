"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpIcon, FolderIcon, GearIcon, PlusIcon, RobotIcon, SpinnerGapIcon } from "@phosphor-icons/react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import type { UserOverview } from "@/lib/api/types"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const PROMPT_SUGGESTIONS = [
  { label: "Start a new project", icon: PlusIcon, href: "/dashboard/projects/new" },
  { label: "View my projects", icon: FolderIcon, href: "/dashboard/projects" },
  { label: "Account settings", icon: GearIcon, href: "/dashboard/settings" },
]

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function greet(name: string) {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name}.`
  if (h < 17) return `Good afternoon, ${name}.`
  return `Good evening, ${name}.`
}

export function OverviewView({ overview }: { overview: UserOverview }) {
  const firstName = overview.user.name.split(" ")[0]
  const userInitials = overview.user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || streaming) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setStreaming(true)

    // Simulated assistant response
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I received: "${trimmed}". This is where daaybot's response would stream in.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setStreaming(false)
    }, 1200)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable message area */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {!hasMessages ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <RobotIcon className="size-7" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-2xl font-bold tracking-tight xs:text-3xl">
                  {greet(firstName)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  What are we building today?
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-2">
              {PROMPT_SUGGESTIONS.map(({ label, icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        ) : (
          /* Chat thread */
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport className="px-4 py-4">
                <MessageScrollerContent className="mx-auto max-w-2xl">
                  <Marker variant="separator">
                    <MarkerContent>Today</MarkerContent>
                  </Marker>

                  {messages.map((msg) => (
                    <MessageScrollerItem
                      key={msg.id}
                      messageId={msg.id}
                      scrollAnchor={msg.role === "user"}
                    >
                      <Message align={msg.role === "user" ? "end" : "start"}>
                        {msg.role === "assistant" && (
                          <MessageAvatar>
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <RobotIcon className="size-4" />
                            </div>
                          </MessageAvatar>
                        )}
                        <MessageContent>
                          {msg.role === "assistant" && (
                            <MessageHeader>daaybot</MessageHeader>
                          )}
                          <Bubble
                            variant={msg.role === "user" ? "default" : "muted"}
                            align={msg.role === "user" ? "end" : "start"}
                          >
                            <BubbleContent>{msg.content}</BubbleContent>
                          </Bubble>
                          <MessageFooter>{formatTime(msg.timestamp)}</MessageFooter>
                        </MessageContent>
                        {msg.role === "user" && (
                          <MessageAvatar>
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {userInitials}
                              </AvatarFallback>
                            </Avatar>
                          </MessageAvatar>
                        )}
                      </Message>
                    </MessageScrollerItem>
                  ))}

                  {streaming && (
                    <MessageScrollerItem messageId="__streaming__">
                      <Message align="start">
                        <MessageAvatar>
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <RobotIcon className="size-4" />
                          </div>
                        </MessageAvatar>
                        <MessageContent>
                          <MessageHeader>daaybot</MessageHeader>
                          <Bubble variant="muted" align="start">
                            <BubbleContent>
                              <SpinnerGapIcon className="size-4 animate-spin" />
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 bg-background px-4 py-3">
        <div className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-xl bg-muted px-3 py-2 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message daaybot…"
            disabled={streaming}
            className="max-h-50 min-h-6 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <Button
            size="icon"
            className="size-8 shrink-0"
            disabled={!input.trim() || streaming}
            onClick={handleSend}
            aria-label="Send"
          >
            {streaming ? (
              <SpinnerGapIcon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          daaybot can make mistakes. Check important info.
        </p>
      </div>
    </div>
  )
}
