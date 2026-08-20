"use client"

import { useState } from "react"
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CopyIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react"

import {
  MessageAction,
  MessageActions,
  MessageResponse,
} from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion"
import { ChatEmoji, type ChatEmojiMood } from "@/components/brand/chat-emoji"
import { GreetingEmoji, greetingPeriod } from "@/components/brand/emoji-cycle"
import {
  ChatComposer,
  FileCard,
  type ComposerFile,
  type SentAttachment,
} from "@/components/dashboard/chat-composer"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { AttachmentGroup } from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import { useBillingGate } from "@/hooks/use-billing-gate"
import { useChatMoodSounds } from "@/hooks/use-chat-mood-sounds"
import { useUserOverview } from "@/hooks/use-dashboard-query"
import { CHAT_MESSAGE_CREDIT_COST } from "@/lib/billing/features"
import { toast } from "sonner"

const CHAT_SUGGESTIONS = [
  "What can you help with?",
  "Draft a short update",
  "Explain this simply",
  "Help me plan a project",
]

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
  const period = greetingPeriod()
  if (period === "morning") return `Morning, ${name}`
  if (period === "afternoon") return `Afternoon, ${name}`
  return `Evening, ${name}`
}

function isSearchQuery(text: string) {
  return /\b(search|look up|google|find online|web search)\b/i.test(text)
}

export function OverviewView({
  showSuggestions = false,
}: {
  showSuggestions?: boolean
}) {
  const { data: overview } = useUserOverview()
  const { ensureAccess, recordUsage } = useBillingGate()
  const firstName = overview?.user.name.split(" ")[0] ?? ""

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

  async function sendChat(text: string) {
    const trimmed = text.trim()
    if ((!trimmed && attachments.length === 0) || streaming) return

    const allowed = await ensureAccess({ requiredBalance: CHAT_MESSAGE_CREDIT_COST })
    if (!allowed) {
      toast.error("You're out of credits")
      return
    }

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

    setTimeout(async () => {
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

      try {
        await recordUsage({ value: CHAT_MESSAGE_CREDIT_COST })
      } catch {
        toast.error("Message sent but usage was not recorded.")
      }
    }, 1200)
  }

  function handleSend() {
    sendChat(input)
  }

  function handleSuggestion(suggestion: string) {
    sendChat(suggestion)
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

  if (!overview) {
    return <DashboardSkeleton />
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col">
        {!hasMessages ? (
          /* Empty state — greeting + input centered together */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
            <h1 className="inline-flex max-w-full flex-row items-center justify-center gap-2 font-heading text-2xl font-semibold tracking-tight xs:text-3xl">
              <GreetingEmoji className="size-8 xs:size-10" />
              <span className="min-w-0" suppressHydrationWarning>
                {greet(firstName)}
              </span>
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
              {showSuggestions ? (
                <div className="mt-3">
                  <Suggestions className="mx-auto">
                    {CHAT_SUGGESTIONS.map((suggestion) => (
                      <Suggestion
                        key={suggestion}
                        suggestion={suggestion}
                        onClick={handleSuggestion}
                        disabled={streaming}
                      />
                    ))}
                  </Suggestions>
                </div>
              ) : null}
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
                            <MessageFooter className="justify-end">
                              <MessageActions>
                                <MessageAction
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-foreground"
                                  tooltip="Copy"
                                  label="Copy"
                                  onClick={() => copyContent(msg.id, msg.content)}
                                >
                                  {copied === msg.id ? (
                                    <CheckIcon className="text-foreground" />
                                  ) : (
                                    <CopyIcon />
                                  )}
                                </MessageAction>
                              </MessageActions>
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      ) : (
                        /* Assistant — plain text, left-aligned, mood face on latest */
                        <Message align="start">
                          <MessageContent>
                            <Bubble variant="ghost" align="start">
                              <BubbleContent className="flex w-full max-w-full items-start gap-1.5 text-sm leading-relaxed">
                                {msg.id === lastAssistant?.id && !streaming ? (
                                  <ChatEmoji mood={chatMood} className="mt-0.5 size-6 shrink-0" />
                                ) : null}
                                <MessageResponse className="size-auto min-w-0 flex-1">
                                  {msg.content}
                                </MessageResponse>
                              </BubbleContent>
                            </Bubble>
                            <MessageFooter>
                              <MessageActions>
                                <MessageAction
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-foreground"
                                  tooltip="Copy"
                                  label="Copy"
                                  onClick={() => copyContent(msg.id, msg.content)}
                                >
                                  {copied === msg.id ? (
                                    <CheckIcon className="text-foreground" />
                                  ) : (
                                    <CopyIcon />
                                  )}
                                </MessageAction>
                                <MessageAction
                                  size="icon-xs"
                                  tooltip="Good response"
                                  label="Good response"
                                  onClick={() => toggleLike(msg.id, "up")}
                                >
                                  <ThumbsUpIcon
                                    weight={liked[msg.id] === "up" ? "fill" : "regular"}
                                  />
                                </MessageAction>
                                <MessageAction
                                  size="icon-xs"
                                  tooltip="Bad response"
                                  label="Bad response"
                                  onClick={() => toggleLike(msg.id, "down")}
                                >
                                  <ThumbsDownIcon
                                    weight={liked[msg.id] === "down" ? "fill" : "regular"}
                                  />
                                </MessageAction>
                                <MessageAction
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-foreground"
                                  tooltip="Regenerate"
                                  label="Regenerate"
                                  onClick={regenerateLast}
                                >
                                  <ArrowClockwiseIcon />
                                </MessageAction>
                              </MessageActions>
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
                              <Shimmer as="span">
                                {chatMood === "searching" ? "Searching…" : "Thinking…"}
                              </Shimmer>
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
    </TooltipProvider>
  )
}
