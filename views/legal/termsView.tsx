import Link from "next/link"

import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/legal-document"
import { LEGAL_EFFECTIVE_DATE, LEGAL_LAST_UPDATED } from "@/lib/legal/dates"
import { siteConfig } from "@/lib/seo"

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    content: (
      <>
        <p>
          These Terms of Service govern your access to and use of{" "}
          <strong>{siteConfig.name}</strong>, the AI website builder at{" "}
          <a href={siteConfig.url} className="min-w-0 break-all" rel="noopener noreferrer">
            {siteConfig.url}
          </a>
          , and related services operated by {siteConfig.creator.name}.
        </p>
        <p>
          By creating an account, signing in, or using the builder dashboard, you
          agree to these Terms and to our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do
          not use the service.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <p>
        You must be at least 13 years old (or the minimum age of digital consent
        in your country, if higher) to create an account. If you use Daaybot on
        behalf of an organization, you represent that you have authority to bind
        that organization to these Terms.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and security",
    content: (
      <>
        <p>
          You are responsible for your sign-in credentials and for activity under
          your account. Keep your password confidential and notify us if you
          suspect unauthorized access.
        </p>
        <p>
          We may suspend or terminate access when we detect abuse, security risk,
          unpaid usage where billing applies, or violations of these Terms.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>use Daaybot for unlawful, harmful, or fraudulent purposes;</li>
          <li>harass others or publish content that infringes third-party rights;</li>
          <li>probe, scrape, or overload the service without permission;</li>
          <li>circumvent security, captcha, rate limits, or credit controls;</li>
          <li>misrepresent your identity or affiliation with {siteConfig.name}.</li>
        </ul>
      </>
    ),
  },
  {
    id: "projects-and-ai",
    title: "Projects, builds, and AI output",
    content: (
      <>
        <p>
          Daaybot helps you create and manage website projects. AI-assisted builds
          may produce draft code, copy, or assets. You are responsible for reviewing
          output before publishing it and for ensuring it complies with applicable
          law.
        </p>
        <p>
          We do not guarantee that generated sites are error-free, secure, or fit
          for a particular purpose. Features, models, and runtime hosts may change
          without notice.
        </p>
      </>
    ),
  },
  {
    id: "credits",
    title: "Credits and billing",
    content: (
      <p>
        Some actions consume credits or require a paid plan. Usage limits, pricing,
        and refund rules are shown in the product or billing surfaces that apply
        to your workspace. We may change plans or pricing with reasonable notice
        where required by law.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    content: (
      <>
        <p>
          You retain ownership of content you submit. You grant us a license to
          host, process, and display that content as needed to operate Daaybot.
        </p>
        <p>
          The Daaybot name, branding, software, and documentation are owned by{" "}
          {siteConfig.creator.name} or licensors and may not be copied or reused
          without permission except as allowed by applicable open-source licenses
          for specific components we publish.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    content: (
      <p>
        Daaybot is provided on an &quot;as is&quot; and &quot;as available&quot;
        basis without warranties of any kind, to the fullest extent permitted by
        law. We do not warrant uninterrupted, secure, or error-free operation.
      </p>
    ),
  },
  {
    id: "limitation",
    title: "Limitation of liability",
    content: (
      <p>
        To the fullest extent permitted by law, {siteConfig.creator.name} and{" "}
        {siteConfig.name} will not be liable for indirect, incidental, special,
        consequential, or punitive damages arising from your use of the service.
        Our total liability for any claim will not exceed the greater of amounts
        you paid us in the twelve months before the claim or one hundred US dollars
        (USD $100).
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these Terms from time to time. We will revise the last
        updated date on this page when we do. Continued use after changes take
        effect means you accept the updated Terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    content: (
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria,
        without regard to conflict-of-law principles, except where mandatory
        consumer protections in your country apply. Contact us at{" "}
        <a href={`mailto:${siteConfig.creator.email}`}>{siteConfig.creator.email}</a>{" "}
        before filing a formal dispute.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions about these Terms: {siteConfig.creator.name} / {siteConfig.name}
        <br />
        Email:{" "}
        <a href={`mailto:${siteConfig.creator.email}`}>{siteConfig.creator.email}</a>
        <br />
        Location: Lagos, Nigeria
      </p>
    ),
  },
]

export function TermsView() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service"
      description={`The rules for using ${siteConfig.name}, including accounts, projects, AI builds, credits, and acceptable use.`}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={sections}
      relatedHref="/privacy"
      relatedLabel="Privacy Policy"
    />
  )
}
