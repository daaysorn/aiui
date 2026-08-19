const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://aiui.daaysorn.com"

export const siteConfig = {
  name: "aiui",
  title: "aiui | daaysorn",
  description:
    "aiui is the daaysorn interface builder: a clear, familiar UI system for products that work as well as they look.",
  url: siteUrl,
  locale: "en_NG",
  creator: {
    name: "Tomiwa David",
    handle: "@daaysorn",
    email: "david@daaysorn.com",
  },
  keywords: [
    "aiui",
    "daaysorn",
    "Tomiwa David",
    "design system",
    "interface builder",
    "shadcn",
    "Next.js",
  ],
  social: {
    github: "https://github.com/daaysorn/aiui",
    instagram: "https://www.instagram.com/daaysorn",
    x: "https://x.com/daaysorn",
  },
} as const
