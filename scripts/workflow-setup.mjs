#!/usr/bin/env node
/**
 * Idempotent Eve Postgres workflow schema bootstrap.
 * Runs before Eve start on deploy (`start-with-eve.mjs`) and via
 * `bun run workflow:setup` locally. Do not run this during Docker/Coolify
 * image build: Coolify internal DB hostnames (e.g. resource UUIDs) do not
 * resolve inside BuildKit (`getaddrinfo ENOTFOUND`).
 *
 * Set WORKFLOW_POSTGRES_URL in Coolify / .env.local.
 * Skip with SKIP_WORKFLOW_SETUP=1 when needed.
 */
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import { setupDatabase } from "@workflow/world-postgres/cli"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function loadLocalEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = join(root, name)
    if (existsSync(path)) {
      loadEnv({ path, override: false })
    }
  }
}

function readEnvFileValue(path, key) {
  if (!existsSync(path)) return null
  const line = readFileSync(path, "utf8")
    .split("\n")
    .find((entry) => entry.startsWith(`${key}=`))
  if (!line) return null
  return line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "")
}

loadLocalEnv()

if (process.env.SKIP_WORKFLOW_SETUP === "1") {
  console.error("[workflow-setup] SKIP_WORKFLOW_SETUP=1 — skipping schema bootstrap.")
  process.exit(0)
}

const fromProcess = process.env.WORKFLOW_POSTGRES_URL?.trim()
const fromLocal =
  readEnvFileValue(join(root, ".env.local"), "WORKFLOW_POSTGRES_URL") ||
  readEnvFileValue(join(root, ".env"), "WORKFLOW_POSTGRES_URL")

const workflowUrl = fromProcess || fromLocal
if (!workflowUrl) {
  console.error(
    "[workflow-setup] WORKFLOW_POSTGRES_URL is required. Set it in Coolify / .env.local."
  )
  process.exit(1)
}

process.env.WORKFLOW_POSTGRES_URL = workflowUrl
// Prevent accidental Nest/app DATABASE_URL takeover inside the upstream CLI.
delete process.env.DATABASE_URL

console.error("[workflow-setup] Bootstrapping Eve Postgres workflow schema…")
await setupDatabase()
