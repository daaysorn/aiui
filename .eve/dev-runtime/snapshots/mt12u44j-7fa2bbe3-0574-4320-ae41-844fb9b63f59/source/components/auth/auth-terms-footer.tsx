import { LegalLink } from "@/components/auth/legal-link"
import { authCopy, siteLinks } from "@/lib/site"

function AuthMutedLine() {
  return <div className="border-t border-border" aria-hidden />
}

function AuthTermsFooter() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-6">
      <div className="pointer-events-auto flex w-full max-w-sm min-w-0 flex-col gap-4 sm:max-w-[26rem]">
        <AuthMutedLine />
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {authCopy.termsPrefix}{" "}
          <LegalLink href={siteLinks.terms}>{authCopy.termsLabel}</LegalLink>{" "}
          {authCopy.termsAnd}{" "}
          <LegalLink href={siteLinks.privacy}>{authCopy.privacyLabel}</LegalLink>
          {authCopy.termsSuffix}
        </p>
      </div>
    </div>
  )
}

export { AuthTermsFooter }
