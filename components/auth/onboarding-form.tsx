"use client"

import { useActionState, useCallback, useState } from "react"
import PhoneInput, { type Value as PhoneValue } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import "react-phone-number-input/style.css"
import { CheckCircleIcon, SpinnerGapIcon, XCircleIcon } from "@phosphor-icons/react"

import { submitOnboarding, type OnboardingState } from "@/app/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAvailability, type Status } from "@/hooks/use-availability"
import { checkUsernameAvailable, checkTelephoneAvailable } from "@/lib/api/auth"
import { authCopy } from "@/lib/site"
import { cn } from "@/lib/utils"

function StatusIcon({ status }: { status: Status }) {
  if (status === "checking") {
    return <SpinnerGapIcon className="size-4 animate-spin text-muted-foreground" aria-hidden />
  }
  if (status === "available") {
    return <CheckCircleIcon className="size-4 text-emerald-500" weight="fill" aria-hidden />
  }
  if (status === "taken") {
    return <XCircleIcon className="size-4 text-destructive" weight="fill" aria-hidden />
  }
  return null
}

function OnboardingForm() {
  const [state, formAction, pending] = useActionState<OnboardingState | null, FormData>(
    submitOnboarding,
    null
  )
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState<PhoneValue>("")

  const checkUsername = useCallback((v: string) => checkUsernameAvailable(v), [])
  const checkPhone = useCallback((v: string) => checkTelephoneAvailable(v), [])

  const usernameStatus = useAvailability(username, { check: checkUsername, minLength: 3 })
  const phoneStatus = useAvailability(phone ?? "", { check: checkPhone, minLength: 7 })

  const canContinue =
    username.trim().length >= 3 &&
    Boolean(phone) &&
    usernameStatus === "available" &&
    phoneStatus === "available"

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight xs:text-3xl">
          Finish setup
        </h1>
        <p className="text-sm text-muted-foreground">Optional. You can skip for now.</p>
      </div>

      <form action={formAction} className="flex w-full min-w-0 flex-col gap-4">
        {state?.error ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <div className="relative">
            <Input
              id="username"
              name="username"
              placeholder={authCopy.placeholders.username}
              minLength={3}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={usernameStatus === "taken" || undefined}
              className={cn(usernameStatus !== "idle" && "pr-8")}
            />
            {usernameStatus !== "idle" && (
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                <StatusIcon status={usernameStatus} />
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="telephone" className="block text-sm font-medium">
            Phone
          </label>
          <div
            className={cn(
              "flex h-9 w-full min-w-0 overflow-hidden rounded-md border bg-transparent text-sm shadow-xs transition-colors focus-within:border-ring",
              phoneStatus === "taken" ? "border-destructive focus-within:border-destructive" : "border-input",
              "[&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:shrink-0 [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:gap-1 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-input [&_.PhoneInputCountry]:px-2.5",
              "[&_.PhoneInputCountryIcon]:block [&_.PhoneInputCountryIcon]:size-4 [&_.PhoneInputCountryIcon--border]:border-0 [&_.PhoneInputCountryIcon--border]:shadow-none",
              "[&_.PhoneInputCountrySelect]:absolute [&_.PhoneInputCountry]:relative [&_.PhoneInputCountrySelect]:inset-0 [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputCountrySelect]:opacity-0",
              "[&_.PhoneInputCountrySelectArrow]:hidden"
            )}
          >
            <PhoneInput
              id="telephone"
              name="telephone"
              flags={flags}
              international
              defaultCountry="NG"
              value={phone}
              onChange={setPhone}
              inputComponent={Input}
              className="flex flex-1 items-center [&_input]:h-full [&_input]:flex-1 [&_input]:rounded-none [&_input]:border-0 [&_input]:shadow-none [&_input]:focus-visible:border-0"
            />
            {phoneStatus !== "idle" && (
              <span className="pointer-events-none flex shrink-0 items-center pr-2.5">
                <StatusIcon status={phoneStatus} />
              </span>
            )}
          </div>
        </div>

        <Button type="submit" loading={pending} disabled={!canContinue || pending}>
          Continue to dashboard
        </Button>

        <Button
          type="submit"
          name="skip"
          value="1"
          formNoValidate
          variant="ghost"
          disabled={pending}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Button>
      </form>
    </div>
  )
}

export { OnboardingForm }
