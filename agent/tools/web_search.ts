import { webSearch } from "eve/tools"

/**
 * Eve provider-managed web search (AI Gateway default path).
 * Exa is Eve’s default for gateway models; Parallel is the other option.
 * @see node_modules/eve/docs/concepts/built-in-tools.md
 */
export default webSearch({ provider: "exa" })
