import { createPageOgImage } from "@/lib/og-page"

const og = createPageOgImage({
  title: "Daaybot",
  description: "AI website builder with a clear, familiar design system.",
  path: "/",
  labels: ["Product", "Builder", "AI"],
  alt: "Daaybot",
})

export const alt = og.alt
export const size = og.size
export const contentType = og.contentType
export default og.Image
