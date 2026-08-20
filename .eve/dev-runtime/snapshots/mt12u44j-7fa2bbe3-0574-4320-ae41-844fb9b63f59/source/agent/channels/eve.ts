import { eveChannel } from "eve/channels/eve"
import { localDev } from "eve/channels/auth"

import { daaybotSessionAuth } from "../daaybot-auth"

export default eveChannel({
  auth: [daaybotSessionAuth, localDev()],
  cors: true,
})
