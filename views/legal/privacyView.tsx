import Link from "next/link"

import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/legal-document"
import { LEGAL_EFFECTIVE_DATE, LEGAL_LAST_UPDATED } from "@/lib/legal/dates"
import { siteConfig } from "@/lib/seo"

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    content: (
      <>
        <p>
          This Privacy Policy explains how <strong>{siteConfig.name}</strong>{" "}
          collects, uses, stores, and shares information when you visit or use{" "}
          <a href={siteConfig.url} className="min-w-0 break-all" rel="noopener noreferrer">
            {siteConfig.url}
          </a>{" "}
          and the builder dashboard operated by {siteConfig.creator.name}.
        </p>
        <p>
          Contact for privacy requests:{" "}
          <a href={`mailto:${siteConfig.creator.email}`}>{siteConfig.creator.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "scope",
    title: "Scope",
    content: (
      <>
        <p>This policy applies when you:</p>
        <ul>
          <li>browse marketing pages for Daaybot;</li>
          <li>create an account, sign in, or reset your password;</li>
          <li>use the dashboard, projects, settings, or billing surfaces;</li>
          <li>contact us by email.</li>
        </ul>
        <p>
          Third-party sign-in providers (for example Google or GitHub) and hosting
          partners process data under their own policies when you use those
          features.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <p>
          <strong>Information you provide.</strong> Account name, email, username,
          phone number, profile details, project names, briefs, and support
          messages you send us.
        </p>
        <p>
          <strong>Information collected automatically.</strong> IP address,
          browser type, device signals, timestamps, and diagnostic data needed to
          secure and operate the service. Cloudflare Turnstile may process
          technical signals when captcha is enabled.
        </p>
        <p>
          <strong>Cookies and sessions.</strong> We use httpOnly cookies to keep
          you signed in to the dashboard and may use cookies for security and
          basic analytics where enabled.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use information",
    content: (
      <>
        <p>We use information to:</p>
        <ul>
          <li>create and authenticate accounts;</li>
          <li>run projects, credits, and builder features you request;</li>
          <li>send verification, reset, and service emails;</li>
          <li>detect abuse, spam, and security incidents;</li>
          <li>improve reliability and support users;</li>
          <li>comply with law and enforce our Terms of Service.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "How we share information",
    content: (
      <>
        <p>We may share information with:</p>
        <ul>
          <li>
            infrastructure and email providers that help us host and deliver
            Daaybot;
          </li>
          <li>authentication and captcha providers when you use those features;</li>
          <li>payment or billing partners when you purchase credits or plans;</li>
          <li>authorities when required by law or to protect rights and safety.</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    title: "Retention",
    content: (
      <p>
        We keep information only as long as needed for the purposes above, unless
        a longer period is required by law. Account data is deleted or anonymized
        when you delete your account, subject to backup and legal retention limits.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <p>
        We use reasonable technical and organizational measures such as HTTPS,
        httpOnly session cookies, and access controls. No method of transmission
        or storage is completely secure.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    content: (
      <p>
        Depending on where you live, you may have rights to access, correct, or
        delete personal information we hold about you. Email{" "}
        <a href={`mailto:${siteConfig.creator.email}`}>{siteConfig.creator.email}</a>{" "}
        with enough detail for us to verify and fulfill your request.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        Daaybot is not directed at children under 13. We do not knowingly collect
        personal information from children. Contact us if you believe a child has
        provided information and we will take appropriate steps to delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. We will revise the
        last updated date on this page when we do. Continued use after an update
        means you acknowledge the revised policy.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <>
        <p>
          Privacy questions and requests:
          <br />
          {siteConfig.creator.name} / {siteConfig.name}
          <br />
          Email:{" "}
          <a href={`mailto:${siteConfig.creator.email}`}>{siteConfig.creator.email}</a>
          <br />
          Location: Lagos, Nigeria
        </p>
        <p>
          Related document: <Link href="/terms">Terms of Service</Link>.
        </p>
      </>
    ),
  },
]

export function PrivacyView() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      description={`How ${siteConfig.name} collects, uses, and protects information when you sign in, manage projects, and use the builder dashboard.`}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={sections}
      relatedHref="/terms"
      relatedLabel="Terms of Service"
    />
  )
}
