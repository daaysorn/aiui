import { z } from "zod"

const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name."),
    email: z.string().trim().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type SignUpValues = z.infer<typeof signUpSchema>
type SignUpFieldErrors = Partial<Record<keyof SignUpValues, string>>

function getSignUpFieldErrors(error: z.ZodError): SignUpFieldErrors {
  const result: SignUpFieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (
      field === "name" ||
      field === "email" ||
      field === "password" ||
      field === "confirmPassword"
    ) {
      result[field] ??= issue.message
    }
  }

  return result
}

export { getSignUpFieldErrors, signUpSchema }
export type { SignUpFieldErrors, SignUpValues }
