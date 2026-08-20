"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CopyIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react"
import type { EveMessage } from "eve/react"
import { toast } from "sonner"

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
  type ComposerFile,
} from "@/components/dashboard/chat-composer"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Button } from "@/components/ui/button"
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
import {
  eveMessageText,
  useDashboardChat,
  useDashboardChatBootstrap,
} from "@/hooks/use-dashboard-chat"
import { useChatMoodSounds } from "@/hooks/use-chat-mood-sounds"
import { useUserOverview } from "@/hooks/use-dashboard-query"

const CHAT_SUGGESTIONS = [
  "What can you help with?",
  "Draft a short update",
  "Explain this simply",
  "Help me plan a project",
]

function greet(name: string) {
  const period = greetingPeriod()
  if (period === "morning") return `Morning, ${name}`
  if (period === "afternoon") return `Afternoon, ${name}`
  return `Evening, ${name}`
}

function isSearchQuery(text: string) {
  return /\b(search|look up|google|find online|web search)\b/i.test(text)
}

function resolveSendToast(reason: "credits" | "attachments" | "busy") {
  if (reason === "credits") {
    toast.error("You're out of credits")
    return
  }
  if (reason === "attachments") {
    toast.error("File attachments are not supported yet.")
    return
  }
  if (reason === "busy") {
    toast.error("Wait for Daaybot to finish the current reply.")
  }
}

function OverviewChatPanel({
  userId,
  workspaceId,
  firstName,
  threadId,
  showSuggestions = false,
  onNewConversation,
  onThreadCreated,
}: {
  userId: string
  workspaceId: string | null
  firstName: string
  threadId: string | null
  showSuggestions?: boolean
  onNewConversation: () => void
  onThreadCreated: (threadId: string) => void
}) {
  const bootstrap = useDashboardChatBootstrap({ userId, threadId })

  if (!bootstrap.ready) {
    return <DashboardSkeleton />
  }

  return (
    <OverviewChatPanelInner
      userId={userId}
      workspaceId={workspaceId}
      firstName={firstName}
      threadId={threadId}
      initial={bootstrap.initial}
      showSuggestions={showSuggestions}
      onNewConversation={onNewConversation}
      onThreadCreated={onThreadCreated}
    />
  )
}

function OverviewChatPanelInner({
  userId,
  workspaceId,
  firstName,
  threadId,
  initial,
  showSuggestions = false,
  onNewConversation,
  onThreadCreated,
}: {
  userId: string
  workspaceId: string | null
  firstName: string
  threadId: string | null
  initial: Parameters<typeof useDashboardChat>[0]["initial"]
  showSuggestions?: boolean
  onNewConversation: () => void
  onThreadCreated: (threadId: string) => void
}) {
  const {
    messages,
    isBusy,
    error,
    sendMessage,
    regenerate,
    registerTrackFailure,
  } = useDashboardChat({
    userId,
    workspaceId,
    threadId,
    initial,
    onThreadCreated,
  })

  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<ComposerFile[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [liked, setLiked] = useState<Record<string, "up" | "down" | null>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    registerTrackFailure(() => {
      toast.error("Message sent but usage was not recorded.")
    })
    return () => registerTrackFailure(null)
  }, [registerTrackFailure])

  useEffect(() => {
    if (!error) return
    toast.error(error.message || "Daaybot could not respond.")
  }, [error])

  function copyContent(id: string, content: string) {
    navigator.clipboard.writeText(content).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied((prev) => (prev === id ? null : prev)), 2000)
  }

  function toggleLike(id: string, dir: "up" | "down") {
    setLiked((prev) => ({ ...prev, [id]: prev[id] === dir ? null : dir }))
  }

  async function regenerateLast() {
    if (isBusy) return
    const result = await regenerate()
    if (!result.ok && result.reason !== "empty") {
      resolveSendToast(result.reason)
    }
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
    const hasAttachments = attachments.length > 0
    if ((!trimmed && !hasAttachments) || isBusy) return

    const result = await sendMessage(trimmed, { hasAttachments })
    if (!result.ok) {
      if (result.reason !== "empty") {
        resolveSendToast(result.reason)
      }
      return
    }

    setInput("")
    setAttachments([])
  }

  function handleSend() {
    void sendChat(input)
  }

  function handleSuggestion(suggestion: string) {
    void sendChat(suggestion)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = mounted && messages.length > 0
  const lastUser = [...messages].reverse().find((message) => message.role === "user")
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")
  const lastUserText = lastUser ? eveMessageText(lastUser) : ""
  const lastAssistantText = lastAssistant ? eveMessageText(lastAssistant) : ""

  const chatMood: ChatEmojiMood = isBusy
    ? isSearchQuery(lastUserText || input)
      ? "searching"
      : "thinking"
    : lastAssistant && liked[lastAssistant.id] === "down"
      ? "sad"
      : lastUser && /^(huh+\??|\?\?+|what\??)$/i.test(lastUserText.trim())
        ? "confused"
        : "default"

  const showThinking = isBusy && !lastAssistantText

  useChatMoodSounds(chatMood)

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col">
          {!hasMessages ? (
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
                  streaming={isBusy}
                />
                {showSuggestions ? (
                  <div className="mt-3">
                    <Suggestions className="mx-auto">
                      {CHAT_SUGGESTIONS.map((suggestion) => (
                        <Suggestion
                          key={suggestion}
                          suggestion={suggestion}
                          onClick={handleSuggestion}
                          disabled={isBusy}
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
            <MessageScrollerProvider autoScroll>
              <MessageScroller className="flex-1">
                <MessageScrollerViewport className="px-4 py-4">
                  <MessageScrollerContent className="mx-auto max-w-2xl">
                    <div className="mb-3 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onNewConversation}
                        disabled={isBusy}
                      >
                        New conversation
                      </Button>
                    </div>
                    <Marker variant="separator">
                      <MarkerContent>Today</MarkerContent>
                    </Marker>

                    {messages.map((message) => (
                      <ChatMessageRow
                        key={message.id}
                        message={message}
                        lastAssistant={lastAssistant}
                        isBusy={isBusy}
                        chatMood={chatMood}
                        copied={copied}
                        liked={liked}
                        onCopy={copyContent}
                        onToggleLike={toggleLike}
                        onRegenerate={regenerateLast}
                      />
                    ))}

                    {showThinking ? (
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
                    ) : null}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          )}
        </div>

        {hasMessages ? (
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
              streaming={isBusy}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground/40">
              Daaybot can make mistakes. Check important info.
            </p>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  )
}

function ChatMessageRow({
  message,
  lastAssistant,
  isBusy,
  chatMood,
  copied,
  liked,
  onCopy,
  onToggleLike,
  onRegenerate,
}: {
  message: EveMessage
  lastAssistant: EveMessage | undefined
  isBusy: boolean
  chatMood: ChatEmojiMood
  copied: string | null
  liked: Record<string, "up" | "down" | null>
  onCopy: (id: string, content: string) => void
  onToggleLike: (id: string, dir: "up" | "down") => void
  onRegenerate: () => void
}) {
  const content = eveMessageText(message)
  const isLatestAssistant = message.role === "assistant" && message.id === lastAssistant?.id

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={message.role === "user"}
    >
      {message.role === "user" ? (
        <Message align="end">
          <MessageContent>
            {content ? (
              <Bubble variant="secondary" align="end">
                <BubbleContent>{content}</BubbleContent>
              </Bubble>
            ) : null}
            <MessageFooter className="justify-end">
              <MessageActions>
                <MessageAction
                  size="icon-xs"
                  className="text-muted-foreground hover:text-foreground"
                  tooltip="Copy"
                  label="Copy"
                  onClick={() => onCopy(message.id, content)}
                >
                  {copied === message.id ? (
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
        <Message align="start">
          <MessageContent>
            <Bubble variant="ghost" align="start">
              <BubbleContent className="flex w-full max-w-full items-start gap-1.5 text-sm leading-relaxed">
                {isLatestAssistant && !isBusy ? (
                  <ChatEmoji mood={chatMood} className="mt-0.5 size-6 shrink-0" />
                ) : null}
                <MessageResponse className="size-auto min-w-0 flex-1">
                  {content}
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
                  onClick={() => onCopy(message.id, content)}
                >
                  {copied === message.id ? (
                    <CheckIcon className="text-foreground" />
                  ) : (
                    <CopyIcon />
                  )}
                </MessageAction>
                <MessageAction
                  size="icon-xs"
                  tooltip="Good response"
                  label="Good response"
                  onClick={() => onToggleLike(message.id, "up")}
                >
                  <ThumbsUpIcon weight={liked[message.id] === "up" ? "fill" : "regular"} />
                </MessageAction>
                <MessageAction
                  size="icon-xs"
                  tooltip="Bad response"
                  label="Bad response"
                  onClick={() => onToggleLike(message.id, "down")}
                >
                  <ThumbsDownIcon weight={liked[message.id] === "down" ? "fill" : "regular"} />
                </MessageAction>
                {isLatestAssistant ? (
                  <MessageAction
                    size="icon-xs"
                    className="text-muted-foreground hover:text-foreground"
                    tooltip="Regenerate"
                    label="Regenerate"
                    onClick={onRegenerate}
                  >
                    <ArrowClockwiseIcon />
                  </MessageAction>
                ) : null}
              </MessageActions>
            </MessageFooter>
          </MessageContent>
        </Message>
      )}
    </MessageScrollerItem>
  )
}

export function OverviewView({
  showSuggestions = false,
}: {
  showSuggestions?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: overview } = useUserOverview()
  const urlThreadId = searchParams.get("thread")
  const [sessionEpoch, setSessionEpoch] = useState(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(urlThreadId)
  const skipUrlThreadSyncRef = useRef(false)

  useEffect(() => {
    if (skipUrlThreadSyncRef.current) {
      skipUrlThreadSyncRef.current = false
      setActiveThreadId(urlThreadId)
      return
    }

    if (urlThreadId === activeThreadId) {
      return
    }

    setActiveThreadId(urlThreadId)
    setSessionEpoch((value) => value + 1)
  }, [activeThreadId, urlThreadId])

  if (!overview) {
    return <DashboardSkeleton />
  }

  const firstName = overview.user.name.split(" ")[0] ?? ""
  const panelKey = `${overview.user.id}:${sessionEpoch}`

  return (
    <OverviewChatPanel
      key={panelKey}
      userId={overview.user.id}
      workspaceId={overview.billing.workspaceId}
      firstName={firstName}
      threadId={activeThreadId}
      showSuggestions={showSuggestions}
      onThreadCreated={(id) => {
        skipUrlThreadSyncRef.current = true
        setActiveThreadId(id)
        router.replace(`/dashboard?thread=${id}`, { scroll: false })
      }}
      onNewConversation={() => {
        skipUrlThreadSyncRef.current = true
        setActiveThreadId(null)
        router.replace("/dashboard", { scroll: false })
        setSessionEpoch((value) => value + 1)
      }}
    />
  )
}
