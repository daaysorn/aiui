import { createPageOgImage } from "@/lib/og-page"

const og = createPageOgImage({
  title: "aiui",
  description: "Interface builder using the daaysorn design system.",
  path: "/",
  labels: ["Product", "Builder", "UI"],
  alt: "aiui | daaysorn",
})

export const alt = og.alt
export const size = og.size
export const contentType = og.contentType
export default og.Image
