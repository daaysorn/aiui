#!/usr/bin/env node
/**
 * Coolify / self-host entrypoint.
 *
 * `withEve` rewrites /eve → http://127.0.0.1:4274, but Next.js production
 * does not spawn that runtime at `next start`. Start the Nitro output first,
 * then Next.
 *
 * Docs: node_modules/eve/docs/guides/frontend/nextjs.mdx
 */
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const eveEntry = join(root, ".output", "server", "index.mjs")
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next")
const evePort = Number.parseInt(
  process.env.EVE_NEXT_PRODUCTION_PORT?.trim() || "4274",
  10
)
const nextPort = process.env.PORT?.trim() || "3000"
const children = []

function fail(message) {
  console.error(`[start-with-eve] ${message}`)
  process.exit(1)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForEveHealth(port, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  const url = `http://127.0.0.1:${port}/eve/v1/health`
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // retry until Eve accepts connections
    }
    await sleep(250)
  }
  fail(`Eve health check failed at ${url}`)
}

function spawnChild(command, args, env) {
  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "inherit",
  })
  children.push(child)
  child.on("exit", (code, signal) => {
    for (const other of children) {
      if (other !== child && !other.killed) {
        other.kill("SIGTERM")
      }
    }
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    process.exit(code ?? 1)
  })
  return child
}

function forwardSignals() {
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      for (const child of children) {
        if (!child.killed) {
          child.kill(signal)
        }
      }
    })
  }
}

async function main() {
  if (!Number.isInteger(evePort) || evePort < 1 || evePort > 65535) {
    fail("EVE_NEXT_PRODUCTION_PORT must be an integer between 1 and 65535")
  }
  if (!existsSync(eveEntry)) {
    fail(
      "Missing .output/server/index.mjs. Run `eve build` (or `bun run build`) before start."
    )
  }
  if (!existsSync(nextBin)) {
    fail("Missing next binary. Run `bun install` before start.")
  }

  const workflowUrl = process.env.WORKFLOW_POSTGRES_URL?.trim()
  if (!workflowUrl) {
    fail(
      "WORKFLOW_POSTGRES_URL is required (dedicated Eve Postgres). Set it in Coolify env."
    )
  }

  forwardSignals()

  console.error("[start-with-eve] ensuring Eve Postgres schema…")
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(root, "scripts", "workflow-setup.mjs")], {
      cwd: root,
      env: { ...process.env, WORKFLOW_POSTGRES_URL: workflowUrl },
      stdio: "inherit",
    })
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`workflow-setup exited with code ${code ?? 1}`))
    })
  })

  console.error(`[start-with-eve] starting Eve on 127.0.0.1:${evePort}`)
  spawnChild(process.execPath, [eveEntry], {
    HOST: "127.0.0.1",
    NITRO_HOST: "127.0.0.1",
    NITRO_PORT: String(evePort),
    PORT: String(evePort),
    WORKFLOW_POSTGRES_URL: workflowUrl,
    WORKFLOW_TARGET_WORLD: "@workflow/world-postgres",
  })

  await waitForEveHealth(evePort)
  console.error(`[start-with-eve] Eve ready; starting Next on :${nextPort}`)

  spawnChild(process.execPath, [nextBin, "start", "-p", nextPort], {
    PORT: nextPort,
  })
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
