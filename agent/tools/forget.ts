import { defineTool } from "eve/tools"
import { z } from "zod"

import { memoryStore } from "../lib/memory-store"
import { requireTenantCaller } from "../lib/tenant"

export default defineTool({
  description: "Delete one long-term memory belonging to the current user.",
  inputSchema: z.object({ key: z.string().min(1).max(80) }),
  async execute({ key }, ctx) {
    const deleted = await memoryStore.delete(requireTenantCaller(ctx), key)
    return { deleted }
  },
})
