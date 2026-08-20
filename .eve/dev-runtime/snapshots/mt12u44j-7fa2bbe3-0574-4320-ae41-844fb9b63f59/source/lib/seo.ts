const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://daaybot.daaysorn.com"

export const siteConfig = {
  name: "Daaybot",
  title: "Daaybot",
  description:
    "Daaybot is the AI website builder: sign in, manage projects, and build sites with Eve chat.",
  url: siteUrl,
  locale: "en_NG",
  creator: {
    name: "Tomiwa David",
    handle: "@daaysorn",
    email: "david@daaysorn.com",
  },
  keywords: [
    "Daaybot",
    "Tomiwa David",
    "design system",
    "interface builder",
    "shadcn",
    "Next.js",
  ],
  social: {
    github: "https://github.com/daaysorn/Daaybot",
    instagram: "https://www.instagram.com/daaysorn",
    x: "https://x.com/daaysorn",
  },
} as const
