# aiui

Next.js frontend for the daaysorn AI website builder. Auth and dashboard talk to the Nest API in `builderbackend`.

## Setup

```bash
bun install
cp env.sample .env.local
```

In `builderbackend/.env`, point the frontend origin at this app:

```env
DEVELOPMENT_URL=http://localhost:3001
PLATFORM_URL=http://localhost:3001
BETTER_AUTH_ERROR_URL=http://localhost:3001/auth/error
```

Run both apps:

```bash
# Terminal 1 — API
cd ../builderbackend && bun run start:dev

# Terminal 2 — UI
bun run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing home |
| `/auth/sign-in` | Email and social sign in |
| `/auth/sign-up` | Create account |
| `/auth/verify-email` | Email OTP verification |
| `/auth/forgot-password` | Password reset OTP |
| `/auth/reset-password` | Set new password |
| `/onboarding` | Username and phone |
| `/dashboard` | Overview, credits, orgs |
| `/dashboard/projects` | Project list |
| `/dashboard/settings` | Profile |

API calls use same-origin `/v1/*` rewrites to Nest. Better Auth client unwraps the `handleResponse` envelope automatically.

## Scripts

```bash
bun run dev
bun run typecheck
bun run lint
bun run build
```

Use Bun for install and scripts. Next runs on Node 24 (`engines.node`). Do not use `bun --bun next dev`.
