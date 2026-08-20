<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Use Montserrat for headings, Geist for body/paragraph text, and JetBrains Mono for code.
- Always write the brand name as lowercase `daaysorn`, including at the beginning of sentences.
- Always write the product name as `Daaybot` (capital D) in all user-facing content, copy, and code strings. Never lowercase it as `daaybot`.
- Page Open Graph descriptions/subtitles must stay on one line (short; no multi-line marketing copy under the title).
- Form/page subtitles (the muted helper text under a heading) must be 4-6 words max — no long marketing copy.
- Never add border lines (`border`, `border-*`, `divide-*`) to any element unless the user explicitly instructs it. Use background color (`bg-muted`, `bg-card`, etc.) or spacing to create visual separation instead.
- The dashboard inset (the rounded main content panel) has no outline or border. Never add outline or border lines there; separate with background and spacing only.
- Never use em dashes in user-facing content.
- Long unbroken strings (tokens, URLs, env lines, hashes) must wrap: `min-w-0` with `break-all` / `overflow-wrap-anywhere`.
- Links, enabled buttons, and dropdown/menu items use a pointer cursor. Never use `cursor-default` on menu rows.
- Never put emails or other personal identifiers in URL query strings. Store them in `localStorage` for the auth flow and clear them after the flow finishes.

## Learned Workspace Facts

- Fonts are wired via `next/font` CSS variables: `--font-heading` (Montserrat), `--font-sans` (Geist), `--font-mono` (JetBrains Mono).
- Design system: follow `public/doc/daaysorn-design-system/SKILL.md`. Deep reference: `public/doc/designSystem.md`. Runtime tokens: `app/globals.css`.
- Custom Tailwind breakpoints: `watch` (300px / 18.75rem) and `xs` (360px / 22.5rem) plus default `sm`–`2xl`. Phone layouts (including iPhone 12 at ~390px) use base + `xs:`, never `sm:` for phone targeting.
- Dark is the default theme. Press `d` to toggle.
- Static/content page OG images use PageLightSwiss via `createPageOgImage` (`lib/og-page.ts`). New routes should add `opengraph-image.tsx` and resolve preview URLs with `lib/og-path` / `localOpenGraphImageSrc`.
- App Router page files stay thin. Compose page bodies in `views/`.
- Buttons and form fields never use focus or active rings; focus is border only (`focus-visible:border-ring`). Never add `ring-*`, `focus-visible:ring-*`, `active:ring-*`, or `aria-invalid:ring-*` on buttons, inputs, textareas, selects, or OTP slots.
- Loading buttons use `<Button loading>` (spinner + original label). Sonner toasts have no close (X) button.
- Enabled buttons, links, and dropdown/menu items use a pointer cursor; disabled controls use `cursor-not-allowed`. Enforced globally in `app/globals.css`. Never use `cursor-default` on menu items.
- Dashboard icons are Phosphor only (`@phosphor-icons/react`). Do not use lucide or react-icons on dashboard views or chrome.
- Pending verify email lives in `lib/auth/pending-verify-email.ts`. Pending reset email lives in `lib/auth/pending-reset-email.ts`. If a legacy `?email=` query lands, copy it into storage and immediately `router.replace` the param away.
