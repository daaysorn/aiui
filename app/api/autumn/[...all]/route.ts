import { cookies } from "next/headers"
import { autumnHandler } from "autumn-js/next"

import { AIUI_ACCESS_COOKIE } from "@/lib/api/cookies"
import { apiRequestOrThrow } from "@/lib/api/fetch"
import type { SessionUser } from "@/lib/api/types"

const secretKey = process.env.AUTUMN_SECRET_KEY?.trim()

export const { GET, POST, DELETE } = autumnHandler({
  ...(secretKey ? { secretKey } : {}),
  identify: async () => {
    const token = (await cookies()).get(AIUI_ACCESS_COOKIE)?.value
    if (!token) {
      return null
    }

    try {
      const { user } = await apiRequestOrThrow<{ user: SessionUser }>("/v1/user/me", {
        token,
      })

      return {
        customerId: user.id,
        customerData: {
          name: user.name,
          email: user.email,
        },
      }
    } catch {
      return null
    }
  },
})
