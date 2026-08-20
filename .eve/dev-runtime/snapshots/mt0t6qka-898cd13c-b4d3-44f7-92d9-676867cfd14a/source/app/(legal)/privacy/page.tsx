import type { Metadata } from "next"

import { PrivacyView } from "@/views/legal/privacyView"
import { siteConfig } from "@/lib/seo"

const title = "Privacy Policy"
const description = `How ${siteConfig.name} collects, uses, and protects information when you sign in and use the builder dashboard.`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title,
    description,
    url: "/privacy",
    type: "website",
  },
  twitter: {
    title,
    description,
  },
}

export default function PrivacyPage() {
  return <PrivacyView />
}
