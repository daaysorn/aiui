"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CopyIcon,
  PencilSimpleIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
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
import { CollapsibleUserBubbleText } from "@/components/dashboard/collapsible-user-bubble-text"
import { ChatWindowSkeleton, DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
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
import { DASHBOARD_NEW_CHAT_EVENT } from "@/lib/chat/thread-title"

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

function mediaTypesFromMessage(message: EveMessage | undefined): string[] {
  if (!message) return []
  return message.parts
    .filter((part) => part.type === "file")
    .map((part) => part.mediaType)
}

type LocalSentMedia = {
  id: string
  mediaType: string
  filename: string
  previewUrl: string
}

/** Eve optimistic turns collapse files to `[file: name]` text — strip those. */
function displayUserBubbleText(content: string) {
  return content
    .replace(/\[file(?::[^\]]*)?\]/gi, "")
    .replace(/\n{2,}/g, "\n")
    .trim()
}

/** Wait-row copy: never "Thinking" — name the action. */
function awaitingReplyLabel(input: {
  searching: boolean
  mediaTypes: string[]
}): string {
  if (input.searching) return "Searching the web…"
  const types = input.mediaTypes
  if (types.some((type) => type.startsWith("image/"))) {
    return "Analyzing image…"
  }
  if (types.some((type) => type.startsWith("audio/"))) {
    return "Listening…"
  }
  if (types.some((type) => type.startsWith("video/"))) {
    return "Watching video…"
  }
  if (
    types.some(
      (type) =>
        type === "application/pdf" ||
        type.includes("pdf") ||
        type.includes("document")
    )
  ) {
    return "Reading document…"
  }
  if (types.length > 0) return "Inspecting file…"
  return "Crafting a reply…"
}

function resolveSendToast(reason: "credits" | "busy" | "too_large") {
  if (reason === "credits") {
    toast.error("You're out of credits")
    return
  }
  if (reason === "too_large") {
    toast.error("Each file must be under 10 MB.")
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
  onThreadCreated,
}: {
  userId: string
  workspaceId: string | null
  firstName: string
  threadId: string | null
  showSuggestions?: boolean
  onThreadCreated: (threadId: string) => void
}) {
  const bootstrap = useDashboardChatBootstrap({ userId, threadId })

  if (!bootstrap.ready) {
    return <ChatWindowSkeleton />
  }

  return (
    <OverviewChatPanelInner
      userId={userId}
      workspaceId={workspaceId}
      firstName={firstName}
      threadId={threadId}
      initial={bootstrap.initial}
      showSuggestions={showSuggestions}
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
  onThreadCreated,
}: {
  userId: string
  workspaceId: string | null
  firstName: string
  threadId: string | null
  initial: Parameters<typeof useDashboardChat>[0]["initial"]
  showSuggestions?: boolean
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
  /** Eve optimistic messages drop file parts — keep previews until the turn ends. */
  const [sentMedia, setSentMedia] = useState<LocalSentMedia[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [liked, setLiked] = useState<Record<string, "up" | "down" | null>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showReplyEmoji, setShowReplyEmoji] = useState(false)
  const [isAwaitingReply, setIsAwaitingReply] = useState(false)
  const wasBusyRef = useRef(false)
  const userCountBeforeSendRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isBusy) {
      wasBusyRef.current = true
      setShowReplyEmoji(true)
      return
    }

    setIsAwaitingReply(false)
    setEditingId(null)

    if (!wasBusyRef.current) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowReplyEmoji(false)
      wasBusyRef.current = false
    }, 5_000)

    return () => window.clearTimeout(timeoutId)
  }, [isBusy])

  useEffect(() => {
    if (sentMedia.length === 0) return
    const latestUser = [...messages]
      .reverse()
      .find((message) => message.role === "user")
    const hasRemoteFiles = (latestUser?.parts ?? []).some(
      (part) => part.type === "file" && Boolean(part.url)
    )
    if (!hasRemoteFiles) return
    setSentMedia((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.previewUrl)
      return []
    })
  }, [messages, sentMedia.length])

  // Do NOT clear sentMedia on threadId change — creating a chat navigates
  // /dashboard → /dashboard/chat/:id and that was wiping image previews.
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

  function beginEditMessage(id: string) {
    if (isBusy || isAwaitingReply) return
    setEditingId(id)
  }

  function cancelEditMessage() {
    setEditingId(null)
  }

  async function saveEditedMessage(message: EveMessage, nextText: string) {
    if (message.role !== "user") return

    const trimmed = nextText.trim()
    if (!trimmed || isBusy || isAwaitingReply) return

    setEditingId(null)
    await sendChat(trimmed)
  }

  async function regenerateLast() {
    if (isBusy || isAwaitingReply) return
    userCountBeforeSendRef.current = messages.reduce(
      (count, message) => (message.role === "user" ? count + 1 : count),
      0
    )
    setIsAwaitingReply(true)
    const result = await regenerate()
    if (!result.ok) {
      setIsAwaitingReply(false)
      if (result.reason !== "empty") {
        resolveSendToast(result.reason)
      }
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
    const pending = attachments
    const files = pending.map((item) => item.file)
    if ((!trimmed && files.length === 0) || isBusy || isAwaitingReply) return

    const mediaSnapshot: LocalSentMedia[] = pending.map((item) => ({
      id: item.id,
      mediaType: item.file.type || "application/octet-stream",
      filename: item.file.name,
      previewUrl: item.previewUrl || URL.createObjectURL(item.file),
    }))

    // Clear composer immediately; keep local previews until Eve echoes file URLs.
    setInput("")
    setAttachments([])
    setSentMedia((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.previewUrl)
      return mediaSnapshot
    })

    // Show wait UI before Eve appends the user message (follow-ups).
    userCountBeforeSendRef.current = messages.reduce(
      (count, message) => (message.role === "user" ? count + 1 : count),
      0
    )
    setIsAwaitingReply(true)

    const result = await sendMessage(trimmed, { files })
    if (!result.ok) {
      setIsAwaitingReply(false)
      setInput(trimmed)
      setAttachments(
        pending.map((item, index) => ({
          ...item,
          previewUrl: mediaSnapshot[index]?.previewUrl ?? item.previewUrl,
        }))
      )
      setSentMedia([])
      if (result.reason !== "empty") {
        resolveSendToast(result.reason)
      }
    }
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
  const lastUserMediaTypes = [
    ...mediaTypesFromMessage(lastUser),
    ...sentMedia.map((item) => item.mediaType),
  ]
  const lastMessage = messages[messages.length - 1]
  const userCount = messages.reduce(
    (count, message) => (message.role === "user" ? count + 1 : count),
    0
  )
  // Previous-turn assistant text must not hide wait UI on follow-ups.
  const replyForCurrentTurnStarted = (() => {
    if (isAwaitingReply && userCount <= userCountBeforeSendRef.current) {
      return false
    }
    if (!lastMessage || lastMessage.role === "user") {
      return false
    }
    return Boolean(eveMessageText(lastMessage))
  })()
  const showAwaiting =
    (isBusy || isAwaitingReply) && !replyForCurrentTurnStarted
  const awaitingLabel = awaitingReplyLabel({
    searching: isSearchQuery(lastUserText || input),
    mediaTypes: lastUserMediaTypes,
  })

  const chatMood: ChatEmojiMood = isBusy || isAwaitingReply
    ? isSearchQuery(lastUserText || input)
      ? "searching"
      : "thinking"
    : lastAssistant && liked[lastAssistant.id] === "down"
      ? "sad"
      : lastUser && /^(huh+\??|\?\?+|what\??)$/i.test(lastUserText.trim())
        ? "confused"
        : "default"

  useChatMoodSounds(chatMood)

  return (
    <TooltipProvider>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!hasMessages ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4">
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
          <>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <MessageScrollerProvider autoScroll>
                <MessageScroller className="absolute inset-0 h-auto">
                  <MessageScrollerViewport className="px-4 py-4">
                    <MessageScrollerContent className="mx-auto max-w-2xl">
                      <Marker variant="separator">
                        <MarkerContent>Today</MarkerContent>
                      </Marker>

                      {messages.map((message) => {
                        // Eve may insert an empty assistant shell before tokens.
                        // Keep wait UI on the thinking row only (one emoji/shimmer).
                        if (
                          message.role === "assistant" &&
                          isBusy &&
                          !eveMessageText(message)
                        ) {
                          return null
                        }

                        return (
                          <ChatMessageRow
                            key={message.id}
                            message={message}
                            lastAssistant={lastAssistant}
                            localMedia={
                              message.role === "user" &&
                              message.id === lastUser?.id
                                ? sentMedia
                                : []
                            }
                            isBusy={isBusy || isAwaitingReply}
                            isEditing={editingId === message.id}
                            showReplyEmoji={showReplyEmoji}
                            chatMood={chatMood}
                            copied={copied}
                            liked={liked}
                            onCopy={copyContent}
                            onToggleLike={toggleLike}
                            onRegenerate={regenerateLast}
                            onBeginEdit={beginEditMessage}
                            onCancelEdit={cancelEditMessage}
                            onSaveEdit={saveEditedMessage}
                          />
                        )
                      })}

                      {showAwaiting ? (
                        <MessageScrollerItem messageId="__streaming__">
                          <Message align="start">
                            <MessageContent>
                              <Bubble variant="ghost" align="start">
                                <BubbleContent className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <ChatEmoji mood={chatMood} className="size-6 shrink-0" />
                                  <Shimmer as="span">{awaitingLabel}</Shimmer>
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
            </div>

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
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

function ChatMessageRow({
  message,
  lastAssistant,
  localMedia,
  isBusy,
  isEditing,
  showReplyEmoji,
  chatMood,
  copied,
  liked,
  onCopy,
  onToggleLike,
  onRegenerate,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  message: EveMessage
  lastAssistant: EveMessage | undefined
  localMedia: LocalSentMedia[]
  isBusy: boolean
  isEditing: boolean
  showReplyEmoji: boolean
  chatMood: ChatEmojiMood
  copied: string | null
  liked: Record<string, "up" | "down" | null>
  onCopy: (id: string, content: string) => void
  onToggleLike: (id: string, dir: "up" | "down") => void
  onRegenerate: () => void
  onBeginEdit: (id: string) => void
  onCancelEdit: () => void
  onSaveEdit: (message: EveMessage, text: string) => void
}) {
  const rawContent = eveMessageText(message)
  const fileParts = message.parts.filter(
    (part) => part.type === "file" && Boolean(part.url)
  )
  const mediaItems =
    fileParts.length > 0
      ? fileParts.map((part, index) => ({
          id: `${message.id}-file-${index}`,
          mediaType: part.mediaType,
          filename: part.filename ?? "Attachment",
          previewUrl: part.url!,
        }))
      : localMedia
  const content = displayUserBubbleText(rawContent)
  const [draft, setDraft] = useState(content)
  const isLatestAssistant =
    message.role === "assistant" && message.id === lastAssistant?.id
  // Copy / like / regen only after the turn finishes.
  const showAssistantActions = isLatestAssistant ? !isBusy : true
  const showAssistantEmoji =
    isLatestAssistant && showReplyEmoji && Boolean(content)
  const canEditUser = message.role === "user" && !isBusy && Boolean(content)

  useEffect(() => {
    if (isEditing) {
      setDraft(content)
    }
  }, [content, isEditing])

  function commitEdit() {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === content) {
      onCancelEdit()
      return
    }
    onSaveEdit(message, trimmed)
  }

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={message.role === "user"}
    >
      {message.role === "user" ? (
        <Message align="end">
          <MessageContent className="items-end gap-2">
            {mediaItems.length > 0 ? (
              <div className="flex max-w-[min(100%,11rem)] flex-col items-end gap-1.5 sm:max-w-[13rem]">
                {mediaItems.map((item) => {
                  const isImage = item.mediaType.startsWith("image/")
                  if (isImage && item.previewUrl) {
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={item.id}
                        src={item.previewUrl}
                        alt={item.filename}
                        className="max-h-40 w-auto max-w-full rounded-2xl object-contain"
                      />
                    )
                  }
                  if (item.mediaType.startsWith("video/") && item.previewUrl) {
                    return (
                      <video
                        key={item.id}
                        src={item.previewUrl}
                        controls
                        className="max-h-40 w-auto max-w-full rounded-2xl bg-muted object-contain"
                      />
                    )
                  }
                  if (item.mediaType.startsWith("audio/") && item.previewUrl) {
                    return (
                      <audio
                        key={item.id}
                        src={item.previewUrl}
                        controls
                        className="w-full max-w-[min(100%,13rem)]"
                      />
                    )
                  }
                  return (
                    <span
                      key={item.id}
                      className="rounded-2xl bg-secondary px-3 py-2 text-xs text-secondary-foreground"
                    >
                      {item.filename || item.mediaType}
                    </span>
                  )
                })}
              </div>
            ) : null}
            {isEditing ? (
              <Bubble variant="secondary" align="end">
                <BubbleContent className="w-full min-w-[min(100%,18rem)]">
                  <textarea
                    value={draft}
                    autoFocus
                    rows={Math.min(8, Math.max(2, draft.split("\n").length))}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault()
                        onCancelEdit()
                      }
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        commitEdit()
                      }
                    }}
                    className="min-h-16 w-full resize-y bg-transparent text-sm leading-relaxed outline-none"
                  />
                </BubbleContent>
              </Bubble>
            ) : content ? (
              <Bubble variant="secondary" align="end">
                <BubbleContent>
                  <CollapsibleUserBubbleText>
                    {content}
                  </CollapsibleUserBubbleText>
                </BubbleContent>
              </Bubble>
            ) : null}
            <MessageFooter className="justify-end">
              <MessageActions>
                {isEditing ? (
                  <>
                    <MessageAction
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground"
                      tooltip="Cancel"
                      label="Cancel"
                      onClick={onCancelEdit}
                    >
                      <XIcon />
                    </MessageAction>
                    <MessageAction
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground"
                      tooltip="Save"
                      label="Save"
                      onClick={commitEdit}
                    >
                      <CheckIcon />
                    </MessageAction>
                  </>
                ) : (
                  <>
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
                    {canEditUser ? (
                      <MessageAction
                        size="icon-xs"
                        className="text-muted-foreground hover:text-foreground"
                        tooltip="Edit"
                        label="Edit"
                        onClick={() => onBeginEdit(message.id)}
                      >
                        <PencilSimpleIcon />
                      </MessageAction>
                    ) : null}
                  </>
                )}
              </MessageActions>
            </MessageFooter>
          </MessageContent>
        </Message>
      ) : (
        <Message align="start">
          <MessageContent>
            <Bubble variant="ghost" align="start">
              <BubbleContent className="flex w-full max-w-full items-start gap-1.5 text-sm leading-relaxed">
                {showAssistantEmoji ? (
                  <ChatEmoji mood={chatMood} className="mt-0.5 size-6 shrink-0" />
                ) : null}
                <MessageResponse className="size-auto min-w-0 flex-1">
                  {content}
                </MessageResponse>
              </BubbleContent>
            </Bubble>
            {showAssistantActions ? (
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
                    <ThumbsUpIcon
                      weight={liked[message.id] === "up" ? "fill" : "regular"}
                    />
                  </MessageAction>
                  <MessageAction
                    size="icon-xs"
                    tooltip="Bad response"
                    label="Bad response"
                    onClick={() => onToggleLike(message.id, "down")}
                  >
                    <ThumbsDownIcon
                      weight={liked[message.id] === "down" ? "fill" : "regular"}
                    />
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
            ) : null}
          </MessageContent>
        </Message>
      )}
    </MessageScrollerItem>
  )
}

export function OverviewView({
  threadId: urlThreadId = null,
  showSuggestions = false,
}: {
  threadId?: string | null
  showSuggestions?: boolean
}) {
  const router = useRouter()
  const { data: overview } = useUserOverview()
  const [sessionEpoch, setSessionEpoch] = useState(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(urlThreadId)
  // Expect this path thread next (string = create, null = leave). undefined = normal sync.
  const pendingUrlThreadRef = useRef<string | null | undefined>(undefined)
  const ignoredStaleThreadRef = useRef<string | null>(null)
  const urlThreadIdRef = useRef(urlThreadId)
  urlThreadIdRef.current = urlThreadId

  useEffect(() => {
    if (pendingUrlThreadRef.current !== undefined) {
      if (urlThreadId === pendingUrlThreadRef.current) {
        pendingUrlThreadRef.current = undefined
        ignoredStaleThreadRef.current = null
        return
      }

      // Local create: wait until `/dashboard/chat/:id` lands.
      if (pendingUrlThreadRef.current && !urlThreadId) {
        return
      }

      // Local leave: ignore the thread we just left until the path clears.
      if (
        pendingUrlThreadRef.current === null &&
        urlThreadId &&
        urlThreadId === ignoredStaleThreadRef.current
      ) {
        return
      }

      // Recents click or other navigation — follow the URL.
      pendingUrlThreadRef.current = undefined
      ignoredStaleThreadRef.current = null
    }

    if (urlThreadId === activeThreadId) {
      return
    }

    setActiveThreadId(urlThreadId)
    setSessionEpoch((value) => value + 1)
  }, [activeThreadId, urlThreadId])

  useEffect(() => {
    function onNewChat() {
      pendingUrlThreadRef.current = null
      ignoredStaleThreadRef.current = urlThreadIdRef.current
      setActiveThreadId(null)
      setSessionEpoch((value) => value + 1)
    }

    window.addEventListener(DASHBOARD_NEW_CHAT_EVENT, onNewChat)
    return () => {
      window.removeEventListener(DASHBOARD_NEW_CHAT_EVENT, onNewChat)
    }
  }, [])

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
        pendingUrlThreadRef.current = id
        ignoredStaleThreadRef.current = null
        setActiveThreadId(id)
        router.replace(`/dashboard/chat/${id}`, { scroll: false })
      }}
    />
  )
}
