<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learned User Preferences

- Use Montserrat for headings, Geist for body/paragraph text, and JetBrains Mono for code.
- Always write the brand name as lowercase `daaysorn`, including at the beginning of sentences.
- Page Open Graph descriptions/subtitles must stay on one line (short; no multi-line marketing copy under the title).
- Never use em dashes in user-facing content.
- Long unbroken strings (tokens, URLs, env lines, hashes) must wrap: `min-w-0` with `break-all` / `overflow-wrap-anywhere`.

## Learned Workspace Facts

- Fonts are wired via `next/font` CSS variables: `--font-heading` (Montserrat), `--font-sans` (Geist), `--font-mono` (JetBrains Mono).
- Design system: follow `public/doc/daaysorn-design-system/SKILL.md`. Deep reference: `public/doc/designSystem.md`. Runtime tokens: `app/globals.css`.
- Custom Tailwind breakpoints: `watch` (300px / 18.75rem) and `xs` (360px / 22.5rem) plus default `sm`–`2xl`. Phone layouts (including iPhone 12 at ~390px) use base + `xs:`, never `sm:` for phone targeting.
- Dark is the default theme. Press `d` to toggle.
- Static/content page OG images use PageLightSwiss via `createPageOgImage` (`lib/og-page.ts`). New routes should add `opengraph-image.tsx` and resolve preview URLs with `lib/og-path` / `localOpenGraphImageSrc`.
- App Router page files stay thin. Compose page bodies in `views/`.
- Inputs never use focus rings; focus is border only (`focus-visible:border-ring`). Buttons keep `ring-ring`.
- Loading buttons use `<Button loading>` (spinner + original label). Sonner toasts have no close (X) button.
