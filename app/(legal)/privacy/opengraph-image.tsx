import { createPageOgImage } from "@/lib/og-page"

const og = createPageOgImage({
  title: "Privacy Policy",
  description: "How daaybot collects, uses, and protects your information.",
  path: "/privacy",
  labels: ["Legal", "Privacy", "Data"],
  alt: "Privacy Policy | daaybot",
})

export const alt = og.alt
export const size = og.size
export const contentType = og.contentType
export default og.Image
