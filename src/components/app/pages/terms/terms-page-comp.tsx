import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, FileText, Mail, Scale, ShieldCheck, UserCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const LAST_UPDATED = "September 1, 2026";

type TocItem = {
  id: string;
  label: string;
};

const TOC: TocItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "acceptance", label: "Acceptance of These Terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Accounts" },
  { id: "account-security", label: "Account Security" },
  { id: "user-content", label: "User Content" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "copyright", label: "Copyright Concerns" },
  { id: "third-party", label: "Third-Party Services and Links" },
  { id: "editorial", label: "Editorial Content" },
  { id: "availability", label: "Website Availability" },
  { id: "privacy", label: "Privacy" },
  { id: "termination", label: "Suspension and Termination" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "general", label: "General Provisions" },
  { id: "contact", label: "Contact INSIDER" },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>

      <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function ExternalTermLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm font-medium text-foreground underline underline-offset-4 decoration-muted-foreground/40 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </Link>
  );
}

export function TermsPageComp() {
  return (
    <main>
      {/* Hero */}
      <header className="border-b border-border/60 pb-10 pt-4 sm:pb-14 sm:pt-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Legal</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Terms of Use
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            These Terms explain the rules that apply when you access and use INSIDER, read our
            content, create an account, participate in discussions, or otherwise interact with our
            website and services.
          </p>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </header>

      {/* Mobile TOC */}
      <div className="mx-auto max-w-3xl py-6 lg:hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="toc" className="border-border/60">
            <AccordionTrigger className="text-sm font-medium">On this page</AccordionTrigger>

            <AccordionContent>
              <nav aria-label="Table of contents">
                <ul className="grid grid-cols-1 gap-2 pt-1 text-sm">
                  {TOC.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Content + sidebar */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-14">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <nav
            aria-label="Table of contents"
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              On this page
            </p>

            <ul className="mt-4 space-y-2.5 border-l border-border/60 text-sm">
              {TOC.map((item) => (
                <li key={item.id} className="pl-4">
                  <a
                    href={`#${item.id}`}
                    className="rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="mx-auto w-full max-w-3xl space-y-12">
          <Section id="introduction" title="Introduction">
            <p>
              INSIDER is a digital publication focused on technology, artificial intelligence,
              software, digital products, science, innovation, productivity, and the changing
              digital world.
            </p>

            <p>
              These Terms of Use (&quot;Terms&quot;) govern your access to and use of INSIDER,
              including reading articles, creating an account, signing in, participating in
              discussions, contacting us, and using other features available through our website at{" "}
              <ExternalTermLink href="https://insider.sudaisazlan.com">
                insider.sudaisazlan.com
              </ExternalTermLink>
              .
            </p>

            <p>
              By using INSIDER, you agree to comply with these Terms and any policies referenced by
              them.
            </p>
          </Section>

          <Section id="acceptance" title="Acceptance of These Terms">
            <p>
              By accessing or using INSIDER, you acknowledge that you have read, understood, and
              agree to these Terms.
            </p>

            <p>
              If you do not agree with these Terms, please do not use INSIDER or its services where
              you have the ability to choose whether to use them.
            </p>

            <p>
              These Terms apply subject to any mandatory rights or protections provided to you under
              applicable law.
            </p>
          </Section>

          <Section id="eligibility" title="Eligibility">
            <p>
              INSIDER is intended for a general audience. You may use the website only where doing
              so is permitted by applicable law.
            </p>

            <p>
              If you create an account or use an interactive feature, you are responsible for
              providing information that is accurate and for complying with any age requirements
              imposed by applicable law.
            </p>
          </Section>

          <Section id="accounts" title="Accounts">
            <p>Certain INSIDER features may require you to create or authenticate an account.</p>

            <p>You agree that you will:</p>

            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground/60">
              <li>Provide accurate information when required.</li>
              <li>Only use an account that you are authorized to use.</li>
              <li>Not impersonate another person, organization, or entity.</li>
              <li>Not use an account for fraud, abuse, deception, or unlawful activity.</li>
            </ul>

            <p>
              We may restrict or suspend accounts that violate these Terms or create security,
              legal, or operational risks.
            </p>
          </Section>

          <Section id="account-security" title="Account Security">
            <p>
              You are responsible for taking reasonable steps to protect your account and the
              devices you use to access INSIDER.
            </p>

            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground/60">
              <li>Keep your authentication credentials secure.</li>
              <li>Avoid unnecessarily sharing account access.</li>
              <li>Use reasonable security practices on devices used to access your account.</li>
              <li>Notify us if you believe your account has been compromised or misused.</li>
            </ul>

            <p>
              No online service can guarantee absolute security. We therefore cannot promise that
              INSIDER or any associated system will be completely secure or impossible to
              compromise.
            </p>
          </Section>

          <Section id="user-content" title="User Content">
            <p>
              INSIDER may allow users to submit comments, messages, feedback, or other content
              through available features.
            </p>

            <p>
              You remain responsible for content you submit. You must have the necessary rights to
              submit that content and must not use INSIDER to publish content that is unlawful,
              threatening, abusive, defamatory, fraudulent, invasive of another person&apos;s
              privacy, infringing, malicious, or otherwise inappropriate.
            </p>

            <p>
              By submitting content to INSIDER, you grant us a non-exclusive license to host, store,
              reproduce, display, distribute, and use that content as reasonably necessary to
              operate, maintain, moderate, secure, and improve the relevant INSIDER features.
            </p>

            <p>This license does not transfer ownership of content that you lawfully own.</p>

            <p>
              We may moderate, restrict, or remove submitted content when we reasonably believe it
              is necessary to enforce these Terms, protect users, prevent abuse, address legal
              requirements, or maintain the integrity of the platform.
            </p>
          </Section>

          <Section id="acceptable-use" title="Acceptable Use">
            <p>You agree to use INSIDER lawfully and responsibly.</p>

            <p>You must not:</p>

            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground/60">
              <li>Break applicable laws or regulations.</li>
              <li>Attempt unauthorized access to INSIDER systems.</li>
              <li>Bypass authentication or security controls.</li>
              <li>Introduce malware or malicious code.</li>
              <li>Interfere with website availability or infrastructure.</li>
              <li>Spam, harass, threaten, or impersonate others.</li>
              <li>Commit fraud or deceptive activity.</li>
              <li>
                Scrape or extract data in a manner that improperly interferes with our operations.
              </li>
              <li>Abuse comments, forms, authentication, or other interactive features.</li>
            </ul>
          </Section>

          <Section id="intellectual-property" title="Intellectual Property">
            <p>
              Unless otherwise indicated, INSIDER and its licensors own or have appropriate rights
              to the website&apos;s original editorial content, text, graphics, branding, logos,
              design, layouts, software, and other materials.
            </p>

            <p>You may access and read INSIDER content for personal and lawful purposes.</p>

            <p>
              You must not reproduce, republish, systematically copy, redistribute, sell, or
              commercially exploit INSIDER content without appropriate authorization, except where
              such use is permitted by applicable law.
            </p>

            <p>
              Third-party trademarks, logos, products, and content referenced on INSIDER remain the
              property of their respective owners.
            </p>
          </Section>

          <Section id="copyright" title="Copyright Concerns">
            <p>
              If you believe content published on INSIDER infringes your copyright, please contact
              us with enough information for us to investigate the concern.
            </p>

            <p>
              Where possible, include a description of the copyrighted work, the allegedly
              infringing material, where it appears on INSIDER, your contact information, and any
              other information reasonably necessary to evaluate the complaint.
            </p>
          </Section>

          <Section id="third-party" title="Third-Party Services and Links">
            <p>
              INSIDER may rely on third-party providers for services such as authentication,
              hosting, analytics, email delivery, storage, security, advertising, or other
              infrastructure.
            </p>

            <p>
              Third-party services operate under their own terms and privacy policies. INSIDER is
              not responsible for the independent practices, availability, security, or content of
              third-party services that we do not control.
            </p>

            <p>
              INSIDER may also link to external websites. Visiting an external website is your
              decision, and you should review that website&apos;s own terms and privacy practices.
            </p>
          </Section>

          <Section id="editorial" title="Editorial Content">
            <p>
              INSIDER publishes articles, guides, reviews, analysis, opinions, tutorials, and other
              informational content.
            </p>

            <p>
              Technology changes quickly. Information about software, AI systems, products,
              companies, specifications, pricing, features, and availability may become outdated or
              change after publication.
            </p>

            <p>
              Our content is provided for general informational and educational purposes and should
              not be treated as professional legal, financial, medical, engineering, security, or
              other specialized advice.
            </p>

            <p>You should independently evaluate information before making important decisions.</p>
          </Section>

          <Section id="availability" title="Website Availability">
            <p>
              We aim to keep INSIDER reliable and accessible, but we do not guarantee uninterrupted
              availability or a specific uptime percentage.
            </p>

            <p>
              INSIDER may occasionally be unavailable because of maintenance, updates,
              infrastructure issues, security events, technical problems, or circumstances outside
              our reasonable control.
            </p>
          </Section>

          <Section id="privacy" title="Privacy">
            <p>
              Our <ExternalTermLink href="/privacy-policy">Privacy Policy</ExternalTermLink>{" "}
              explains how INSIDER collects, uses, stores, and protects information and describes
              relevant privacy choices and rights.
            </p>

            <p>The Privacy Policy forms part of the policies governing your use of INSIDER.</p>
          </Section>

          <Section id="termination" title="Suspension and Termination">
            <p>
              We may suspend, restrict, or terminate access to an account, feature, or part of
              INSIDER when we reasonably believe it is necessary to protect the platform, users,
              infrastructure, or comply with applicable law.
            </p>

            <p>
              This may include circumstances involving serious violations of these Terms, fraud,
              abuse, security concerns, unlawful activity, or repeated misuse of the website.
            </p>

            <p>
              You may stop using INSIDER at any time. Where account deletion is available, you may
              also request deletion in accordance with our Privacy Policy and applicable law.
            </p>
          </Section>

          <Section id="disclaimers" title="Disclaimers">
            <p>
              To the maximum extent permitted by applicable law, INSIDER and its content are
              provided on an &quot;as available&quot; basis.
            </p>

            <p>
              We do not guarantee that the website will always be available, completely accurate,
              error-free, current, secure, or suitable for every particular purpose.
            </p>

            <p>
              Nothing in these Terms excludes or limits rights or protections that cannot legally be
              excluded under applicable law.
            </p>
          </Section>

          <Section id="liability" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, INSIDER will not be responsible for
              indirect, incidental, consequential, special, or similar losses arising from your use
              of the website or inability to use it.
            </p>

            <p>
              Nothing in this section is intended to exclude or limit liability that cannot legally
              be excluded or limited.
            </p>
          </Section>

          <Section id="indemnification" title="Indemnification">
            <p>
              To the extent permitted by applicable law, you agree to be responsible for claims,
              losses, or reasonable costs arising from your unlawful use of INSIDER, your violation
              of these Terms, your infringement of another person&apos;s rights, or your misuse of
              the platform.
            </p>
          </Section>

          <Section id="governing-law" title="Governing Law">
            <p>
              These Terms are generally governed by the laws applicable in Pakistan, subject to any
              mandatory rights and protections that apply to you under the laws of your place of
              residence.
            </p>

            <p>
              Where applicable law provides mandatory protections that cannot be waived by contract,
              those protections remain unaffected.
            </p>
          </Section>

          <Section id="changes" title="Changes to These Terms">
            <p>
              We may update these Terms from time to time as INSIDER evolves, new features are
              introduced, business practices change, or legal requirements develop.
            </p>

            <p>
              The latest version will be published on this page and will include the date on which
              it was last updated.
            </p>

            <p>
              Your continued use of INSIDER after an updated version becomes effective constitutes
              acceptance of the revised Terms to the extent permitted by applicable law.
            </p>
          </Section>

          <Section id="general" title="General Provisions">
            <p>
              <span className="font-medium text-foreground">Severability.</span> If any provision of
              these Terms is found to be invalid or unenforceable, the remaining provisions will
              continue to apply to the extent permitted by law.
            </p>

            <p>
              <span className="font-medium text-foreground">Entire agreement.</span> These Terms and
              the policies referenced in them constitute the applicable agreement governing your use
              of INSIDER, subject to applicable law and any separately agreed written terms.
            </p>

            <p>
              <span className="font-medium text-foreground">No waiver.</span> Our failure to
              immediately enforce a provision does not mean that we waive our right to enforce it
              later.
            </p>

            <p>
              <span className="font-medium text-foreground">Assignment.</span> We may assign these
              Terms as part of a reasonable business transfer. You may not assign your rights or
              obligations under these Terms without our consent where such consent is legally
              required.
            </p>
          </Section>

          <Section id="contact" title="Contact INSIDER">
            <p>
              If you have questions about these Terms, believe something on INSIDER needs attention,
              or have a legal concern about our website or content, please contact us.
            </p>

            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  General
                </div>

                <a
                  href="mailto:tabish@codewithtabish.com"
                  className="mt-2 block break-all text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  tabish@codewithtabish.com
                </a>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Privacy
                </div>

                <a
                  href="mailto:privacy@insider.sudaisazlan.com"
                  className="mt-2 block break-all text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  privacy@insider.sudaisazlan.com
                </a>
              </div>
            </div>
          </Section>

          <Separator className="bg-border/60" />

          {/* Final navigation */}
          <nav
            aria-label="Related policies"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-4 text-sm"
          >
            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-1.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Privacy Policy
            </Link>

            <Link
              href="/accessibility"
              className="inline-flex items-center gap-1.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <UserCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Accessibility
            </Link>

            <a
              href="https://insider.sudaisazlan.com"
              className="inline-flex items-center gap-1.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              insider.sudaisazlan.com
            </a>
          </nav>
        </div>
      </div>
    </main>
  );
}

export default TermsPageComp;
