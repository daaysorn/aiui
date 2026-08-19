# daaybot

Next.js frontend for the daaybot AI website builder. Auth and dashboard talk to the Nest API in `builderbackend`.

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

## Auth and session (daayboard pattern)

1. **Better Auth client** talks directly to Nest at `NEXT_PUBLIC_API_URL` (`/v1/auth`).
2. After sign-in or verify, the UI calls **`POST /auth/session`** to store bearer + refresh tokens in httpOnly cookies (`aiui_access_token`, `aiui_refresh_token`).
3. **Server components** read the access cookie and call Nest with `Authorization: Bearer`.
4. **Sign out** uses **`DELETE /auth/session`**, which clears cookies and calls Nest sign-out.
5. **OAuth** finishes at `/callback`, resolves tokens, then persists the session the same way.

Clean URLs (`/sign-in`, `/sign-up`, etc.) rewrite to internal `app/auth/*` routes. Dashboard routes are gated in layout and `proxy.ts`.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing home |
| `/sign-in` | Email and social sign in |
| `/sign-up` | Create account |
| `/verify-email` | Email OTP verification |
| `/forgot-password` | Password reset (OTP or token link) |
| `/callback` | OAuth return handler |
| `/onboarding` | Username and phone |
| `/dashboard` | Overview, credits, orgs |
| `/dashboard/projects` | Project list |
| `/dashboard/settings` | Profile |

## Scripts

```bash
bun run dev
bun run typecheck
bun run lint
bun run build
```

Use Bun for install and scripts. Next runs on Node 24 (`engines.node`). Do not use `bun --bun next dev`.
