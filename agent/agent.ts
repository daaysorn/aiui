import { defineAgent, defineDynamic } from "eve"

import { resolveNestGatewayModel } from "./nest-gateway"

export default defineAgent({
  model: defineDynamic({
    events: {
      "step.started": async () => resolveNestGatewayModel(),
    },
  }),
})
