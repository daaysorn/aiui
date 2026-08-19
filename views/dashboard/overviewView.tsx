"use client"

import { useState } from "react"
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CopyIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react"

import { ChatEmoji, type ChatEmojiMood } from "@/components/brand/chat-emoji"
import {
  ChatComposer,
  FileCard,
  type ComposerFile,
  type SentAttachment,
} from "@/components/dashboard/chat-composer"
import { AttachmentGroup } from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { useChatMoodSounds } from "@/hooks/use-chat-mood-sounds"
import type { UserOverview } from "@/lib/api/types"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: SentAttachment[]
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function greet(name: string) {
  const h = new Date().getHours()
  if (h < 12) return `Morning, ${name}`
  if (h < 17) return `Afternoon, ${name}`
  return `Evening, ${name}`
}

function isSearchQuery(text: string) {
  return /\b(search|look up|google|find online|web search)\b/i.test(text)
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
  const [attachments, setAttachments] = useState<ComposerFile[]>([])
  const [streaming, setStreaming] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [liked, setLiked] = useState<Record<string, "up" | "down" | null>>({})

  function copyContent(id: string, content: string) {
    navigator.clipboard.writeText(content).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied((prev) => (prev === id ? null : prev)), 2000)
  }

  function toggleLike(id: string, dir: "up" | "down") {
    setLiked((prev) => ({ ...prev, [id]: prev[id] === dir ? null : dir }))
  }

  function regenerateLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser || streaming) return
    setMessages((prev) => prev.filter((m) => m.role !== "assistant" || prev.indexOf(m) < prev.indexOf(lastUser)))
    setStreaming(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Regenerated response to: "${lastUser.content}".`,
          timestamp: new Date(),
        },
      ])
      setStreaming(false)
    }, 1200)
  }

  function handleTranscript(text: string) {
    setInput((prev) => (prev ? `${prev} ${text}` : text))
  }

  function handleAddFiles(files: File[]) {
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  function handleRemoveFile(id: string) {
    setAttachments((prev) => {
      const next = prev.filter((item) => item.id !== id)
      const removed = prev.find((item) => item.id === id)
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return next
    })
  }

  function handleSend() {
    const trimmed = input.trim()
    if ((!trimmed && attachments.length === 0) || streaming) return

    const sentAttachments: SentAttachment[] = attachments.map((item) => ({
      id: item.id,
      name: item.file.name,
      type: item.file.type,
      previewUrl: item.previewUrl,
    }))

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
      attachments: sentAttachments.length ? sentAttachments : undefined,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setAttachments([])
    setStreaming(true)

    const receivedLabel = trimmed || sentAttachments.map((item) => item.name).join(", ")

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I received: "${receivedLabel}". This is where Daaybot's response would stream in.`,
          timestamp: new Date(),
        },
      ])
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
  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")

  const chatMood: ChatEmojiMood = streaming
    ? isSearchQuery(lastUser?.content ?? input)
      ? "searching"
      : "thinking"
    : lastAssistant && liked[lastAssistant.id] === "down"
      ? "sad"
      : lastUser && /^(huh+\??|\?\?+|what\??)$/i.test(lastUser.content.trim())
        ? "confused"
        : "default"

  useChatMoodSounds(chatMood)

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col">
        {!hasMessages ? (
          /* Empty state — greeting + input centered together */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
            <h1 className="inline-flex max-w-full flex-row items-center justify-center gap-2.5 font-heading text-3xl font-semibold tracking-tight xs:text-4xl">
              <ChatEmoji mood={chatMood} className="size-10 shrink-0 xs:size-12" />
              <span className="min-w-0">{greet(firstName)}</span>
            </h1>
            <div className="w-full">
              <ChatComposer
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                onTranscript={handleTranscript}
                attachments={attachments}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
                streaming={streaming}
              />
              <p className="mt-3 text-center text-xs text-muted-foreground/40">
                Daaybot can make mistakes. Check important info.
              </p>
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
                      {msg.role === "user" ? (
                        /* User — pill bubble, right-aligned, no avatar */
                        <Message align="end">
                          <MessageContent>
                            {msg.attachments?.length ? (
                              <AttachmentGroup className="justify-end">
                                {msg.attachments.map((file) => (
                                  <FileCard
                                    key={file.id}
                                    name={file.name}
                                    type={file.type}
                                    previewUrl={file.previewUrl}
                                  />
                                ))}
                              </AttachmentGroup>
                            ) : null}
                            {msg.content ? (
                              <Bubble variant="secondary" align="end">
                                <BubbleContent>{msg.content}</BubbleContent>
                              </Bubble>
                            ) : null}
                            <MessageFooter className="justify-end gap-1">
                              <Button
                                variant="ghost" size="icon"
                                className="size-6 text-muted-foreground hover:text-foreground"
                                aria-label="Copy"
                                onClick={() => copyContent(msg.id, msg.content)}
                              >
                                {copied === msg.id
                                  ? <CheckIcon className="size-3.5 text-foreground" />
                                  : <CopyIcon className="size-3.5" />}
                              </Button>
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      ) : (
                        /* Assistant — plain text, left-aligned, mood face on latest */
                        <Message align="start">
                          <MessageContent>
                            <Bubble variant="ghost" align="start">
                              <BubbleContent className="flex items-start gap-1.5 text-sm leading-relaxed">
                                {msg.id === lastAssistant?.id && !streaming ? (
                                  <ChatEmoji mood={chatMood} className="mt-0.5 size-6 shrink-0" />
                                ) : null}
                                <span className="min-w-0">{msg.content}</span>
                              </BubbleContent>
                            </Bubble>
                            <MessageFooter className="gap-1">
                              <Button
                                variant="ghost" size="icon"
                                className="size-6 text-muted-foreground hover:text-foreground"
                                aria-label="Copy"
                                onClick={() => copyContent(msg.id, msg.content)}
                              >
                                {copied === msg.id
                                  ? <CheckIcon className="size-3.5 text-foreground" />
                                  : <CopyIcon className="size-3.5" />}
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="size-6 hover:text-foreground"
                                aria-label="Good response"
                                onClick={() => toggleLike(msg.id, "up")}
                              >
                                <ThumbsUpIcon
                                  className="size-3.5"
                                  weight={liked[msg.id] === "up" ? "fill" : "regular"}
                                  color={liked[msg.id] === "up" ? "currentColor" : undefined}
                                />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="size-6 hover:text-foreground"
                                aria-label="Bad response"
                                onClick={() => toggleLike(msg.id, "down")}
                              >
                                <ThumbsDownIcon
                                  className="size-3.5"
                                  weight={liked[msg.id] === "down" ? "fill" : "regular"}
                                  color={liked[msg.id] === "down" ? "currentColor" : undefined}
                                />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="size-6 text-muted-foreground hover:text-foreground"
                                aria-label="Regenerate"
                                onClick={regenerateLast}
                              >
                                <ArrowClockwiseIcon className="size-3.5" />
                              </Button>
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      )}
                    </MessageScrollerItem>
                  ))}

                  {streaming && (
                    <MessageScrollerItem messageId="__streaming__">
                      <Message align="start">
                        <MessageContent>
                          <Bubble variant="ghost" align="start">
                            <BubbleContent className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <ChatEmoji mood={chatMood} className="size-6 shrink-0" />
                              <span>
                                {chatMood === "searching" ? "Searching…" : "Thinking…"}
                              </span>
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

      {/* Input bar — only shown when chat is active */}
      {hasMessages && (
        <div className="shrink-0 bg-background px-4 py-3">
          <ChatComposer
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            onTranscript={handleTranscript}
            attachments={attachments}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            streaming={streaming}
          />
          <p className="mt-2 text-center text-xs text-muted-foreground/40">
            Daaybot can make mistakes. Check important info.
          </p>
        </div>
      )}
    </div>
  )
}
