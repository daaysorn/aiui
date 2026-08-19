import { createPageOgImage } from "@/lib/og-page"

const og = createPageOgImage({
  title: "Terms of Service",
  description: "Rules for accounts, projects, AI builds, and credits on Daaybot.",
  path: "/terms",
  labels: ["Legal", "Terms"],
  alt: "Terms of Service | Daaybot",
})

export const alt = og.alt
export const size = og.size
export const contentType = og.contentType
export default og.Image
