"use client"

import { useActionState, useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  CameraIcon,
  CheckCircleIcon,
  SpinnerGapIcon,
  XCircleIcon,
} from "@phosphor-icons/react"

import {
  updateProfileAction,
  type SettingsState,
} from "@/app/(dashboard)/dashboard/settings/actions"
import { PhoneNumberField, type PhoneValue } from "@/components/auth/phone-number-field"
import {
  SettingsCard,
  SettingsNotice,
  SettingsPanel,
} from "@/components/dashboard/settings-ui"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAvailability, type Status } from "@/hooks/use-availability"
import { useUserOverview } from "@/hooks/use-dashboard-query"
import { checkTelephoneAvailable, checkUsernameAvailable } from "@/lib/api/auth"
import { queryKeys } from "@/lib/query/keys"
import { authCopy } from "@/lib/site"
import { cn } from "@/lib/utils"

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "checking") {
    return <SpinnerGapIcon className="size-4 animate-spin text-muted-foreground" aria-hidden />
  }
  if (status === "available") {
    return <CheckCircleIcon className="size-4 text-success" weight="fill" aria-hidden />
  }
  if (status === "taken") {
    return <XCircleIcon className="size-4 text-destructive" weight="fill" aria-hidden />
  }
  return null
}

function readSquareProfileImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read image."))
    reader.onload = () => {
      const image = new window.Image()
      image.onload = () => {
        const size = 256
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext("2d")
        if (!context) {
          reject(new Error("Could not process image."))
          return
        }
        const scale = Math.max(size / image.width, size / image.height)
        const width = image.width * scale
        const height = image.height * scale
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.86))
      }
      image.onerror = () => reject(new Error("Could not process image."))
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

function AccountPanel() {
  const { data: overview } = useUserOverview()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const seeded = useRef(false)
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState("")
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<SettingsState | null, FormData>(
    updateProfileAction,
    null
  )
  const user = overview?.user

  const checkUsername = useCallback((value: string) => checkUsernameAvailable(value), [])
  const checkPhone = useCallback((value: string) => checkTelephoneAvailable(value), [])

  const currentUsername = (user?.username ?? "").trim()
  const currentPhone = (user?.telephone ?? "").trim()
  const usernameChanged = username.trim() !== currentUsername
  const phoneChanged = (phone ?? "").trim() !== currentPhone

  const usernameStatus = useAvailability(usernameChanged ? username : "", {
    check: checkUsername,
    minLength: 3,
  })
  const phoneStatus = useAvailability(phoneChanged ? (phone ?? "") : "", {
    check: checkPhone,
    minLength: 7,
  })

  const usernameBlocked =
    usernameChanged &&
    username.trim().length > 0 &&
    (username.trim().length < 3 ||
      usernameStatus === "taken" ||
      usernameStatus === "checking")
  const phoneBlocked =
    phoneChanged &&
    Boolean(phone) &&
    ((phone ?? "").trim().length < 7 ||
      phoneStatus === "taken" ||
      phoneStatus === "checking")

  useEffect(() => {
    if (!user || seeded.current) return
    seeded.current = true
    setUsername(user.username ?? "")
    setPhone((user.telephone as PhoneValue) ?? "")
  }, [user])

  useEffect(() => {
    if (!state?.message) return
    setImageData("")
    seeded.current = false
    void queryClient.invalidateQueries({ queryKey: queryKeys.overview })
  }, [queryClient, state?.message])

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose a JPG or PNG.")
      return
    }
    try {
      const dataUrl = await readSquareProfileImage(file)
      setPreview(dataUrl)
      setImageData(dataUrl)
      setPhotoError(null)
    } catch {
      setPhotoError("Could not read that image.")
    }
  }

  if (!user) return null

  return (
    <form action={formAction}>
      <SettingsPanel>
        {state?.error ? <SettingsNotice tone="error">{state.error}</SettingsNotice> : null}
        {state?.message ? (
          <SettingsNotice tone="success">{state.message}</SettingsNotice>
        ) : null}
        {photoError ? <SettingsNotice tone="error">{photoError}</SettingsNotice> : null}

        <SettingsCard title="Profile photo" description="JPG or PNG only.">
          <div className="flex items-center gap-4">
            <div className="relative size-20 shrink-0">
              <button
                type="button"
                className="size-full cursor-pointer overflow-hidden rounded-full"
                onClick={() => fileRef.current?.click()}
                aria-label="Change photo"
              >
                <Avatar className="size-full">
                  <AvatarImage src={preview ?? user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{initialsFromName(user.name)}</AvatarFallback>
                </Avatar>
              </button>
              <span className="pointer-events-none absolute right-0.5 bottom-0.5 z-10 flex size-7 items-center justify-center rounded-full bg-muted text-foreground">
                <CameraIcon className="size-3.5" weight="fill" />
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <button
                type="button"
                className="w-fit cursor-pointer text-sm font-medium"
                onClick={() => fileRef.current?.click()}
              >
                Upload new photo
              </button>
              <p className="text-sm text-muted-foreground">
                Square crop applied automatically.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handlePhotoChange}
            />
            {imageData ? <input type="hidden" name="image" value={imageData} /> : null}
          </div>
        </SettingsCard>

        <SettingsCard title="Profile details" description="How you appear across daaysorn.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="settings-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="settings-email"
                value={user.email}
                placeholder={authCopy.placeholders.email}
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="settings-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="settings-name"
                name="name"
                defaultValue={user.name}
                placeholder={authCopy.placeholders.name}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="settings-username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <Input
                  id="settings-username"
                  name="username"
                  value={username}
                  placeholder={authCopy.placeholders.username}
                  autoComplete="username"
                  maxLength={30}
                  onChange={(event) => setUsername(event.target.value)}
                  aria-invalid={usernameStatus === "taken" || undefined}
                  className={cn(usernameStatus !== "idle" && "pr-8")}
                />
                {usernameStatus !== "idle" ? (
                  <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                    <StatusIcon status={usernameStatus} />
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="settings-telephone" className="text-sm font-medium">
                Phone
              </label>
              <PhoneNumberField
                id="settings-telephone"
                name="telephone"
                value={phone}
                onChange={setPhone}
                invalid={phoneStatus === "taken"}
              >
                {phoneStatus !== "idle" ? (
                  <span className="pointer-events-none flex shrink-0 items-center pr-2.5">
                    <StatusIcon status={phoneStatus} />
                  </span>
                ) : null}
              </PhoneNumberField>
            </div>
            <Button
              type="submit"
              className="self-start"
              loading={pending}
              disabled={usernameBlocked || phoneBlocked}
            >
              Save changes
            </Button>
          </div>
        </SettingsCard>
      </SettingsPanel>
    </form>
  )
}

export { AccountPanel }
