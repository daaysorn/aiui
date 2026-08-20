import { defineAgent, defineDynamic } from "eve"

import { resolveNestGatewayModel } from "./nest-gateway"

export default defineAgent({
  model: defineDynamic({
    events: {
      "step.started": async () => resolveNestGatewayModel(),
    },
  }),
  experimental: {
    workflow: {
      // Pin matches Eve 0.39 vendored Workflow line (see eve CHANGELOG 0.38.2).
      world: "@workflow/world-postgres",
    },
  },
  build: {
    // Native/pg + worker stack must resolve at runtime, not be tree-shaken away.
    externalDependencies: ["@workflow/world-postgres", "pg", "graphile-worker"],
  },
})
