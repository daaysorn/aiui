"use client"

import { useActionState, useState } from "react"
import PhoneInput, { type Value as PhoneValue } from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import "react-phone-number-input/style.css"

import { submitOnboarding, type OnboardingState } from "@/app/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authCopy } from "@/lib/site"

function OnboardingForm() {
  const [state, formAction, pending] = useActionState<OnboardingState | null, FormData>(
    submitOnboarding,
    null
  )
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState<PhoneValue>("")

  const canContinue = username.trim().length >= 3 && Boolean(phone)

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
          <Input
            id="username"
            name="username"
            placeholder={authCopy.placeholders.username}
            minLength={3}
            maxLength={30}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="telephone" className="block text-sm font-medium">
            Phone
          </label>
          <div className="flex h-9 w-full min-w-0 overflow-hidden rounded-md border border-input bg-transparent text-sm shadow-xs transition-colors focus-within:border-ring [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:shrink-0 [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:gap-1 [&_.PhoneInputCountry]:border-r [&_.PhoneInputCountry]:border-input [&_.PhoneInputCountry]:px-2.5 [&_.PhoneInputCountryIcon]:block [&_.PhoneInputCountryIcon]:size-4 [&_.PhoneInputCountryIcon--border]:border-0 [&_.PhoneInputCountryIcon--border]:shadow-none [&_.PhoneInputCountrySelect]:absolute [&_.PhoneInputCountrySelect]:inset-0 [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputCountrySelect]:opacity-0 [&_.PhoneInputCountrySelectArrow]:hidden">
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
          </div>
        </div>

        <Button type="submit" loading={pending} disabled={!canContinue || pending}>
          Continue to dashboard
        </Button>

        <Button type="submit" name="skip" value="1" variant="ghost" disabled={pending} className="text-muted-foreground hover:text-foreground">
          Skip for now
        </Button>
      </form>
    </div>
  )
}

export { OnboardingForm }
