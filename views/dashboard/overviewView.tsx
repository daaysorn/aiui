"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowClockwiseIcon,
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  MicrophoneIcon,
  PaperclipIcon,
  SpinnerGapIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react"

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
import type { UserOverview } from "@/lib/api/types"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
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

function InputBar({
  value,
  onChange,
  onKeyDown,
  onSend,
  onTranscript,
  disabled,
  streaming,
  placeholder = "Message daaybot…",
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  onTranscript: (text: string) => void
  disabled?: boolean
  streaming?: boolean
  placeholder?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  function handleAttach() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Inject filename as a message placeholder — real upload wired later
    onTranscript(`[Attached: ${file.name}]`)
    e.target.value = ""
  }

  function handleVoice() {
    const SpeechRecognition =
      window.SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.")
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? ""
      if (transcript) onTranscript(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl items-end gap-1 rounded-2xl bg-muted px-3 py-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
        disabled={disabled}
        onClick={handleAttach}
        aria-label="Attach file"
      >
        <PaperclipIcon className="size-4" />
      </Button>

      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={listening ? "Listening…" : placeholder}
        disabled={disabled}
        className="max-h-50 min-h-6 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={listening ? "size-8 text-destructive" : "size-8 text-muted-foreground hover:text-foreground"}
          disabled={disabled}
          onClick={handleVoice}
          aria-label={listening ? "Stop listening" : "Voice input"}
        >
          <MicrophoneIcon className="size-4" />
        </Button>
        <Button
          size="icon"
          className="size-8"
          disabled={!value.trim() || disabled}
          onClick={onSend}
          aria-label="Send"
        >
          {streaming ? (
            <SpinnerGapIcon className="size-4 animate-spin" />
          ) : (
            <ArrowUpIcon className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
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

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I received: "${trimmed}". This is where daaybot's response would stream in.`,
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

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col">
        {!hasMessages ? (
          /* Empty state — greeting + input centered together */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
            <h1 className="font-heading text-3xl font-semibold tracking-tight xs:text-4xl">
              {greet(firstName)}
            </h1>
            <div className="w-full">
              <InputBar
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                onTranscript={handleTranscript}
                streaming={streaming}
              />
              <p className="mt-3 text-center text-xs text-muted-foreground/40">
                daaybot can make mistakes. Check important info.
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
                            <Bubble variant="secondary" align="end">
                              <BubbleContent>{msg.content}</BubbleContent>
                            </Bubble>
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
                        /* Assistant — plain text, left-aligned, no bubble, no avatar */
                        <Message align="start">
                          <MessageContent>
                            <Bubble variant="ghost" align="start">
                              <BubbleContent className="text-sm leading-relaxed">
                                {msg.content}
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
                            <BubbleContent>
                              <span className="inline-flex gap-1">
                                <span className="animate-bounce text-muted-foreground" style={{ animationDelay: "0ms" }}>●</span>
                                <span className="animate-bounce text-muted-foreground" style={{ animationDelay: "150ms" }}>●</span>
                                <span className="animate-bounce text-muted-foreground" style={{ animationDelay: "300ms" }}>●</span>
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
          <InputBar
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            onTranscript={handleTranscript}
            streaming={streaming}
          />
          <p className="mt-2 text-center text-xs text-muted-foreground/40">
            daaybot can make mistakes. Check important info.
          </p>
        </div>
      )}
    </div>
  )
}
