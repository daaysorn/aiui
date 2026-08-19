"use client"

import { useActionState } from "react"

import { submitOnboarding, type OnboardingState } from "@/app/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function OnboardingForm() {
  const [state, formAction, pending] = useActionState<OnboardingState | null, FormData>(
    submitOnboarding,
    null
  )

  return (
    <form
      action={formAction}
      className="mx-auto flex w-full max-w-sm min-w-0 flex-col gap-4 px-6 py-12"
    >
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Finish setup</h1>
        <p className="text-sm text-muted-foreground">
          Pick a username and phone number for your daaysorn account.
        </p>
      </div>
      {state?.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <Input id="username" name="username" minLength={3} maxLength={30} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="telephone" className="text-sm font-medium">
          Phone
        </label>
        <Input id="telephone" name="telephone" type="tel" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Continue to dashboard"}
      </Button>
    </form>
  )
}

export { OnboardingForm }
