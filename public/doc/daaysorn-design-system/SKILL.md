---
name: daaysorn-design-system
description: daaysorn's design system — tokens, fonts, breakpoints, radius, and components for building UI in this repo. Use when building or editing any UI, styling components, choosing colors/spacing/typography, adding responsive/breakpoint behavior, theming (light/dark), or porting the system to another site, or when the user says to use the daaysorn-design-system skill.
---

# daaysorn Design System

Authoritative rules for building UI in this repo.

|                      |                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Main (edit here)** | `public/doc/daaysorn-design-system/SKILL.md` · https://github.com/daaysorn/daaysorn/blob/main/public/doc/daaysorn-design-system/SKILL.md |
| **Deep reference**   | `public/doc/designSystem.md` · https://github.com/daaysorn/daaysorn/blob/main/public/doc/designSystem.md                                 |
| **Runtime tokens**   | `app/globals.css`                                                                                                                        |

Read the relevant doc section before non-trivial UI work (progressive disclosure map in the last section).

## Rules the agent must never violate

1. Use **semantic tokens only** — never hard-code hex/oklch/rgb or raw px colors in components. Use `bg-*`, `text-*`, `border-*` mapped from tokens.
2. Colors come from these roles: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `border`, `input`, `ring`, `sidebar*`, `chart-1..5`. Nothing else.
3. Quiet/secondary text = `text-muted-foreground`. Quiet fills/skeletons = `bg-muted`. Brand emphasis = `text-primary` (often `font-semibold`). Ghost actions = `<Button variant="ghost">` (transparent until hover).
4. Type is role-based: **Geist** body (`font-sans`, default), **Montserrat** headings (`<h1>`–`<h6>` auto via base layer), **JetBrains Mono** code (`font-mono`, `<code>`/`<kbd>`/`pre`). Don't introduce other fonts.
5. Radius uses the scale (`rounded-sm`…`rounded-4xl`) derived from `--radius`. Don't invent arbitrary radii.
6. Breakpoints are mobile-first: **base → `watch` (300px) → `xs` (360px) → `sm` 640 → `md` 768 → `lg` 1024 → `xl` 1280 → `2xl` 1536**. Phone layout is **base**; `sm:` is NOT "phone".
7. iPhone 12 (~390px) = **base + `xs:`**, never `sm:`. Put phone styling in base/`xs:`.
8. Use `max-watch:` for glanceable/ultra-narrow simplifications only; don't build primary UI inside `watch:` min-width.
9. Keep Tailwind defaults `sm`–`2xl` intact (shadcn/ecosystem compatibility). Only `watch`/`xs` are custom.
10. Merge classes with `cn()` from `@/lib/utils` — never manual string concatenation for conditional classes.
11. Reuse existing components (`components/ui/*`) and their APIs before creating new ones. New components use CVA variants consuming tokens.
12. Respect theming: dark is default; support light via semantic tokens, not per-color overrides. `d` key toggles theme.
13. Accessibility is non-negotiable: visible focus on **buttons and form fields** uses `focus-visible:border-ring` only (no `ring-*` on focus or active). `aria-label` on icon-only controls, ≥4.5:1 text contrast, external links get `rel="noopener noreferrer"`.
14. Long unbroken strings (tokens, env lines, URLs, hashes) must wrap — use `min-w-0`, `break-all` / `overflow-wrap-anywhere`, and never let mono blocks overflow. See `public/doc/designSystem.md` §13.6.

15. The brand name is always written as lowercase **daaysorn**, including at the beginning of a sentence and in names such as **daaysorn account** and **daaysorn-cmp**.
16. Page body content must stay inside the shared `<main>` column used by Home: `w-full min-w-0`, with the same left and right edges. Do not use viewport-width breakout layouts, negative translation, or page-specific horizontal offsets unless the user explicitly requests a wider page.
17. Enabled buttons and links use a pointer cursor; disabled buttons use `cursor-not-allowed`. The runtime enforces this globally for `a[href]`, `button`, `[role="button"]`, and `[data-slot="button"]`. Preserve that rule and use `cursor-pointer` when a component must state the behavior locally. Never leave actionable links or buttons on the default cursor.
18. Keep App Router page files thin. `app/**/page.tsx` owns route concerns such as metadata, params, and revalidation, then imports the page composition from `views/`. Data loading and the full body layout belong in that view. A feature with one view uses `views/<routeName>View.tsx`, such as `views/galleryView.tsx`. As soon as a feature has more than one view file, create `views/<feature>/`, keep all of its views there, and add `views/<feature>/index.ts` to export them to the root `views/index.ts`. Rants therefore lives in `views/rants/`. Reusable or interactive sections belong in `components/<feature>/`. Do not rebuild an entire page body directly in its route file.
19. Never use Unicode arrow glyphs such as `←`, `→`, `‹`, or `›` as navigation icons. Use Phosphor carets such as `CaretLeftIcon` and `CaretRightIcon`, paired with an accessible text label.
20. Treat performance as part of the visual system. Static page copy and layout stay in Server Components; add the smallest practical Client Component around state, browser APIs, realtime, or gestures. Do not make a whole page client-side for one interactive detail.
21. Use CSS-first motion for page reveals, fades, simple transforms, skeletons, and reduced-motion fallbacks. Do not add a JavaScript animation library for effects expressible in `app/globals.css`. Keep Motion only where continuous pointer physics or gesture state materially improves the interaction, such as Dock magnification.
22. Link previews must be lightweight. Internal links use generated OG/static preview images and must never load a full local route in an iframe. External screenshots should be generated once and cached where practical. A hover must not start page analytics, realtime connections, media polling, or service-worker work for the previewed page.
23. Loading feedback must preserve the final layout. Show a skeleton only while an asset has never loaded in the current session; once a preview succeeds or fails, retain that settled state and do not flash the skeleton again during ordinary hover/open cycles.
24. **Page OG images** (via `createPageOgImage` / `renderPageOgImage` → PageLightSwiss) must keep the supporting **description on one line** — never wrap. Write short copy (roughly ≤72 characters). The template enforces `white-space: nowrap`. See `public/doc/designSystem.md` §8.9.
25. Never use em dashes (`—`) in user-facing content. Rewrite the sentence with a period, comma, colon, or parentheses instead. This rule applies to headings, body copy, labels, descriptions, metadata, and generated editorial content.
26. Buttons and form fields **never use focus or active rings**. Use `focus-visible:border-ring` only. Never add `focus-visible:ring-*`, `active:ring-*`, `ring-3`, or `aria-invalid:ring-*` to buttons, inputs, textareas, selects, or OTP slots. Runtime lock: `app/globals.css` zeros `--tw-ring-shadow` on those surfaces for focus and active.
27. Loading actions use `<Button loading>`. The button shows a `Spinner`, sets `aria-busy`, and disables itself. Keep the action label. Do not replace the label with "Saving..." / "Creating..." as the only loading feedback.
28. Sonner toasts have **no close (X) button**. Never pass `closeButton`. Toasts dismiss by timeout or swipe. Runtime lock: `app/globals.css` hides `[data-close-button]`.
29. Dashboard icons are **Phosphor only** (`@phosphor-icons/react`). Do not use `lucide-react` or `react-icons` in `components/dashboard/*`, `views/dashboard/*`, or dashboard chrome (sidebar, overview chat). Auth already uses Phosphor; keep that set.

## Form focus

| Surface                      | Focus                                                             | Invalid                           |
| ---------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| Input, textarea, select, OTP | `focus-visible:border-ring` only (no `ring-*`)                    | `aria-invalid:border-destructive` |
| Button                       | `focus-visible:border-ring` only (no `ring-*`)                    | `aria-invalid:border-destructive` |

## Token → utility quick map

| Need                  | Utility                                                 |
| --------------------- | ------------------------------------------------------- |
| Page canvas           | `bg-background text-foreground`                         |
| Elevated surface      | `bg-card text-card-foreground` / `bg-popover`           |
| Primary action        | `<Button>` (`bg-primary text-primary-foreground`)       |
| Quiet text            | `text-muted-foreground`                                 |
| Quiet fill / skeleton | `bg-muted` (+ `animate-pulse` for loaders)              |
| Ghost action          | `<Button variant="ghost">`                              |
| Live text shimmer     | `motion-safe:animate-text-shimmer` (~5.5s ease-in-out)  |
| Live pulse            | `motion-safe:animate-pulse` / `animate-music-pulse`     |
| Brand emphasis        | `text-primary font-semibold`                            |
| Borders / inputs      | `border-border` / `border-input`                        |
| Input focus           | `focus-visible:border-ring` only (never `ring-*`)       |
| Button focus          | `focus-visible:border-ring` only (never `ring-*`)       |
| Loading button        | `<Button loading>` (spinner + keep the label)           |
| Danger                | `variant="destructive"` / `text-destructive`            |
| Success               | `text-success` / `bg-success`                           |
| Actionable link / button | `cursor-pointer` (enforced globally)                    |

## Typography

- Body: default (`font-sans` = Geist). Headings: use real `<h*>` tags (Montserrat applied in base layer). Code: `<code>`/`<kbd>`/`pre` or `font-mono`.
- Common patterns: caption `text-sm text-muted-foreground`; mono hint `font-mono text-xs text-muted-foreground`.

## Breakpoints

```tsx
// phone base → modern-phone polish → tablet
<div className="flex flex-col gap-3 xs:gap-4 md:flex-row md:gap-6" />
<nav className="hidden md:flex" />          // desktop nav
<div className="max-md:px-4" />              // phone-only
<header className="max-watch:py-2" />        // ultra-narrow
```

Full rationale (why not Tailwind naming, device table): `public/doc/designSystem.md` §7.

## Radius

`--radius` (0.625rem) drives `sm`(6px) `md`(8px) `lg`(10px) `xl`(14px) `2xl`(18px) `3xl`(22px) `4xl`(26px). Button default `rounded-md`; Dock `rounded-2xl`; icons `rounded-full`.

## Components (existing APIs — reuse these)

```tsx
import { Button } from "@/components/ui/button"
<Button variant="default|outline|secondary|ghost|destructive|link" size="default|xs|sm|lg|icon|icon-xs|icon-sm|icon-lg" />
<Button loading>Save</Button>
<Button render={<Link href="/x" />}>Go</Button>

import { Input } from "@/components/ui/input"
<Input /> // focus: border-ring only, never ring-*

import { RobotIcon } from "@phosphor-icons/react" // dashboard/auth icons only
<RobotIcon className="size-4" />

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dock, DockIcon } from "@/components/ui/dock"
```

Details/variants: `public/doc/designSystem.md` §10.

## Build checklist

Before writing UI:

```
- [ ] Identified the semantic tokens (no raw colors)
- [ ] Correct font roles (headings via <h*>, code via <code>/font-mono)
- [ ] Mobile-first: base styles first, then xs:/md:/lg: as needed
- [ ] Reusing components/ui/* where possible
```

After writing UI:

```
- [ ] No hard-coded hex/oklch/px colors
- [ ] Classes merged with cn(); conditional classes clean
- [ ] Buttons and form fields have no focus/active ring (`border-ring` only)
- [ ] Loading actions use `<Button loading>` (spinner + original label, not "Saving..." alone)
- [ ] Toasts have no close (X) button
- [ ] Focus visible on buttons + aria-labels on icon-only controls
- [ ] Dashboard icons are Phosphor (`@phosphor-icons/react`), not lucide or react-icons
- [ ] Renders in light AND dark (semantic tokens only)
- [ ] Reads well at base width (iPhone 12 = base + xs:)
- [ ] Long tokens/URLs/env lines wrap (`min-w-0 break-all`) — no horizontal overflow
- [ ] Route file is thin; page composition lives in the matching `views/*View.tsx`
- [ ] Static layout/content stays server-rendered; client boundaries wrap only interaction
- [ ] Simple motion is CSS-first and has a reduced-motion outcome
- [ ] Internal link previews use OG/static images, never full-page iframes
- [ ] Settled previews do not flash their skeleton again
- [ ] Page OG description is one line (≤72 chars); never multi-line subtext
- [ ] User-facing content contains no em dashes (`—`)
```

## Portability (use on any site)

Same system, swap **token values only** (keep token names + component APIs). `app/globals.css` was generated from [shadcn/ui Create](https://ui.shadcn.com/create) — replace `:root`/`.dark` values (or paste a new Create export) freely; do not rename semantic tokens. To rebrand: change OKLCH values, `--radius`, fonts in `app/layout.tsx`, and `--breakpoint-*` rems if needed. Full contract: `public/doc/designSystem.md` §15 (esp. §15.7).

## Progressive disclosure — open the doc when

| Task                                    | Read section                       |
| --------------------------------------- | ---------------------------------- |
| Colors / tokens / muted text            | §3 (incl. §3.6)                    |
| Fonts / type scale                      | §4                                 |
| Radius                                  | §5                                 |
| Layout / shell                          | §6                                 |
| Responsive / breakpoints                | §7                                 |
| Motion / ghost / loaders / previews / OG | §8 (incl. §8.7–§8.9)               |
| Theming (light/dark)                    | §9                                 |
| Component variants/APIs                 | §10                                |
| Form focus / no rings                   | Form focus (rule) + §12            |
| Loading buttons / toasts                | §10.1 Button loading + §10.8       |
| Accessibility                           | §12                                |
| Recipes                                 | §13 (incl. §13.6 long-string wrap) |
| Add token/font/component                | §14                                |
| Rebrand / multi-brand / reuse elsewhere | §15                                |
