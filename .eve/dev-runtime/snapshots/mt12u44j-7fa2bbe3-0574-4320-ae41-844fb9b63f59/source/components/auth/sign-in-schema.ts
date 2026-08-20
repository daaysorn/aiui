import { z } from "zod"

const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .min(8, "Password must be at least 8 characters."),
  captchaToken: z.string().min(1, "Complete the Turnstile check to continue."),
})

type SignInValues = z.infer<typeof signInSchema>
type SignInFieldErrors = Partial<Record<keyof SignInValues, string>>

function getSignInFieldErrors(error: z.ZodError): SignInFieldErrors {
  const result: SignInFieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (field === "identifier" || field === "password" || field === "captchaToken") {
      result[field] ??= issue.message
    }
  }

  return result
}

export { getSignInFieldErrors, signInSchema }
export type { SignInFieldErrors, SignInValues }
