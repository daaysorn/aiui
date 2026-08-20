"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowUpIcon,
  FileAudioIcon,
  FileCodeIcon,
  FilePdfIcon,
  FileTextIcon,
  FileVideoIcon,
  MicrophoneIcon,
  PlusIcon,
  SpinnerGapIcon,
  XIcon,
} from "@phosphor-icons/react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type ComposerFile = {
  id: string
  file: File
  previewUrl: string | null
}

export type SentAttachment = {
  id: string
  name: string
  type: string
  previewUrl: string | null
}

function fileKind(file: { name: string; type: string }) {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()

  if (type.startsWith("image/")) return "image" as const
  if (type.startsWith("video/")) return "video" as const
  if (type.startsWith("audio/")) return "audio" as const
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf" as const
  }
  if (
    type.includes("javascript") ||
    type.includes("json") ||
    type.includes("xml") ||
    type.includes("typescript") ||
    /\.(tsx?|jsx?|json|md|css|html|py|go|rs|vue|svelte|yml|yaml|toml|sql|sh)$/i.test(name)
  ) {
    return "code" as const
  }
  if (type.startsWith("text/") || /\.(txt|csv|log)$/i.test(name)) {
    return "text" as const
  }
  return "file" as const
}

function FileKindIcon({ kind }: { kind: ReturnType<typeof fileKind> }) {
  if (kind === "pdf") return <FilePdfIcon />
  if (kind === "code") return <FileCodeIcon />
  if (kind === "video") return <FileVideoIcon />
  if (kind === "audio") return <FileAudioIcon />
  return <FileTextIcon />
}

function AttachmentPreviewBody({
  name,
  kind,
  previewUrl,
}: {
  name: string
  kind: ReturnType<typeof fileKind>
  previewUrl: string | null
}) {
  const [text, setText] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!previewUrl || (kind !== "text" && kind !== "code")) return

    let cancelled = false
    setText(null)
    setFailed(false)

    fetch(previewUrl)
      .then((res) => res.text())
      .then((value) => {
        if (!cancelled) setText(value.slice(0, 200_000))
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [kind, previewUrl])

  if (!previewUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        This file cannot be previewed.
      </p>
    )
  }

  if (kind === "image") {
    return (
      <img
        src={previewUrl}
        alt={name}
        className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
      />
    )
  }

  if (kind === "video") {
    return (
      <video
        src={previewUrl}
        controls
        className="max-h-[75vh] w-full rounded-lg bg-muted"
      />
    )
  }

  if (kind === "audio") {
    return <audio src={previewUrl} controls className="w-full" />
  }

  if (kind === "pdf") {
    return (
      <iframe
        title={name}
        src={previewUrl}
        className="h-[75vh] w-full rounded-lg bg-muted"
      />
    )
  }

  if (kind === "text" || kind === "code") {
    if (failed) {
      return (
        <p className="text-sm text-muted-foreground">
          This file cannot be previewed.
        </p>
      )
    }

    if (text == null) {
      return <p className="text-sm text-muted-foreground">Loading preview…</p>
    }

    return (
      <pre className="max-h-[70vh] min-w-0 overflow-auto font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
        {text}
      </pre>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-7">
        <FileKindIcon kind={kind} />
      </div>
      <p className="min-w-0 max-w-full text-center text-sm break-all">{name}</p>
      <Button
        variant="secondary"
        size="sm"
        render={<a href={previewUrl} download={name} />}
        nativeButton={false}
      >
        Download
      </Button>
    </div>
  )
}

function FileCard({
  name,
  type,
  previewUrl,
  onRemove,
}: {
  name: string
  type: string
  previewUrl: string | null
  onRemove?: () => void
}) {
  const kind = fileKind({ name, type })
  const [open, setOpen] = useState(false)

  return (
    <>
      <Attachment
        state="done"
        size="sm"
        orientation="vertical"
        className="border-0 bg-background"
      >
        {kind === "image" && previewUrl ? (
          <AttachmentMedia variant="image">
            <img src={previewUrl} alt="" />
          </AttachmentMedia>
        ) : (
          <AttachmentMedia variant="icon">
            <FileKindIcon kind={kind} />
          </AttachmentMedia>
        )}
        <AttachmentContent>
          <AttachmentTitle>{name}</AttachmentTitle>
        </AttachmentContent>
        <AttachmentTrigger
          aria-label={`Preview ${name}`}
          onClick={() => setOpen(true)}
        />
        {onRemove ? (
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${name}`} onClick={onRemove}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        ) : null}
      </Attachment>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="min-w-0 break-all">{name}</DialogTitle>
            <DialogDescription className="sr-only">
              File preview
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <AttachmentPreviewBody
              name={name}
              kind={kind}
              previewUrl={previewUrl}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function ChatComposer({
  value,
  onChange,
  onKeyDown,
  onSend,
  onTranscript,
  attachments,
  onAddFiles,
  onRemoveFile,
  disabled,
  streaming,
  placeholder = "Message Daaybot…",
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  onTranscript: (text: string) => void
  attachments: ComposerFile[]
  onAddFiles: (files: File[]) => void
  onRemoveFile: (id: string) => void
  disabled?: boolean
  streaming?: boolean
  placeholder?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const canSend = Boolean(value.trim() || attachments.length)

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
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length) onAddFiles(files)
    e.target.value = ""
  }

  function handleVoice() {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

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

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ""
      if (transcript) onTranscript(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-muted px-3 py-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*,video/*,.pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {attachments.length > 0 ? (
        <AttachmentGroup>
          {attachments.map((item) => (
            <FileCard
              key={item.id}
              name={item.file.name}
              type={item.file.type}
              previewUrl={item.previewUrl}
              onRemove={() => onRemoveFile(item.id)}
            />
          ))}
        </AttachmentGroup>
      ) : null}

      <div className="flex items-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
          onClick={handleAttach}
          aria-label="Attach file"
        >
          <PlusIcon />
        </Button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={listening ? "Listening…" : placeholder}
          disabled={disabled}
          className="max-h-50 min-h-8 w-full min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm leading-5 outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={
              listening
                ? "size-8 text-destructive"
                : "size-8 text-muted-foreground hover:text-foreground"
            }
            disabled={disabled}
            onClick={handleVoice}
            aria-label={listening ? "Stop listening" : "Voice input"}
          >
            <MicrophoneIcon />
          </Button>
          <Button
            size="icon"
            className="size-8 rounded-full"
            disabled={streaming ? true : !canSend || disabled}
            onClick={onSend}
            aria-label="Send"
          >
            {streaming ? <SpinnerGapIcon className="animate-spin" /> : <ArrowUpIcon />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ChatComposer, FileCard }
