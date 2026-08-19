import { createPageOgImage } from "@/lib/og-page"

const og = createPageOgImage({
  title: "daaybot",
  description: "AI website builder with a clear, familiar design system.",
  path: "/",
  labels: ["Product", "Builder", "AI"],
  alt: "daaybot",
})

export const alt = og.alt
export const size = og.size
export const contentType = og.contentType
export default og.Image
