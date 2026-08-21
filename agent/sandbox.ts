import { defineSandbox } from "eve/sandbox"
import { justbash } from "eve/sandbox/just-bash"

/**
 * Pin just-bash for Daaybot.
 *
 * Eve stages user attachments under `/workspace/attachments` before the first
 * model step. `defaultBackend()` prefers microsandbox on Apple Silicon, which
 * boots a VM and hangs local chat (especially media). just-bash is in-process
 * and fast enough for vision staging + light file tools.
 */
export default defineSandbox({
  backend: justbash(),
})
