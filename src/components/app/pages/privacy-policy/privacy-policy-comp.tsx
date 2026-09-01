import Link from "next/link";
import type { ReactNode } from "react";

interface SectionMeta {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: SectionMeta[] = [
  { id: "privacy-section-01", number: "01", title: "Introduction" },
  { id: "privacy-section-02", number: "02", title: "Information We Collect" },
  { id: "privacy-section-03", number: "03", title: "How We Use Information" },
  { id: "privacy-section-04", number: "04", title: "Accounts and Authentication" },
  { id: "privacy-section-05", number: "05", title: "Comments and User-Provided Content" },
  { id: "privacy-section-06", number: "06", title: "Public Information and Search Engines" },
  { id: "privacy-section-07", number: "07", title: "Newsletter" },
  { id: "privacy-section-08", number: "08", title: "Contact Form" },
  { id: "privacy-section-09", number: "09", title: "Cookies and Similar Technologies" },
  { id: "privacy-section-10", number: "10", title: "Cookie Preferences and Controls" },
  { id: "privacy-section-11", number: "11", title: "Analytics" },
  { id: "privacy-section-12", number: "12", title: "Advertising" },
  { id: "privacy-section-13", number: "13", title: "Third-Party Service Providers" },
  { id: "privacy-section-14", number: "14", title: "International Data Processing" },
  { id: "privacy-section-15", number: "15", title: "Third-Party Links" },
  { id: "privacy-section-16", number: "16", title: "Embedded Content" },
  { id: "privacy-section-17", number: "17", title: "Data Retention" },
  { id: "privacy-section-18", number: "18", title: "Data Security" },
  { id: "privacy-section-19", number: "19", title: "Security Incidents" },
  { id: "privacy-section-20", number: "20", title: "Your Privacy Rights" },
  { id: "privacy-section-21", number: "21", title: "Access and Correction Requests" },
  { id: "privacy-section-22", number: "22", title: "Account and Data Deletion" },
  { id: "privacy-section-23", number: "23", title: "Children's Privacy" },
  { id: "privacy-section-24", number: "24", title: "Data Sharing" },
  { id: "privacy-section-25", number: "25", title: "User Choices" },
  { id: "privacy-section-26", number: "26", title: "Legal and Business Operations" },
  { id: "privacy-section-27", number: "27", title: "Changes to This Privacy Policy" },
];

function SectionNumber({ number }: { number: string }) {
  return (
    <span className="font-mono text-sm font-semibold tracking-widest text-primary">{number}</span>
  );
}

function PrivacySection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 border-t border-border py-10 md:py-14"
    >
      <div className="mb-6 flex items-baseline gap-4">
        <SectionNumber number={number} />

        <h2
          id={`${id}-heading`}
          className="text-xl font-semibold tracking-tight text-foreground md:text-2xl"
        >
          {title}
        </h2>
      </div>

      <div className="space-y-4 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        {children}
      </div>
    </section>
  );
}

function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground transition-colors">
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>

      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <main className="pb-20 pt-16 md:pb-28 md:pt-24">
      <article className="mx-auto max-w-4xl">
        {/* Hero */}
        <header className="mb-16">
          <span className="mb-4 block text-sm font-medium uppercase tracking-wider text-primary">
            Privacy & Trust
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">
            Learn how INSIDER collects, uses, protects, and manages personal information when you
            visit our publication, create an account, subscribe to our newsletter, submit a message,
            leave a comment, or otherwise interact with our services.
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: <time dateTime="2026-08-19">August 19, 2026</time>
          </p>
        </header>

        {/* Quick Summary */}
        <div className="mb-16 grid gap-4 sm:grid-cols-3">
          <SummaryCard title="Transparency">
            We explain what information INSIDER may collect, how it may be used, and why it may be
            necessary to operate our editorial platform and services.
          </SummaryCard>

          <SummaryCard title="Your choices">
            Depending on your location and applicable law, you may have rights to request access,
            correction, deletion, restriction, or other controls over your personal information.
          </SummaryCard>

          <SummaryCard title="International">
            INSIDER is operated from Pakistan and serves readers and users internationally. Privacy
            rights and requirements may vary depending on where you are located.
          </SummaryCard>
        </div>

        {/* Table of Contents */}
        <nav
          aria-label="Privacy Policy contents"
          className="mb-16 rounded-2xl border border-border bg-muted/50 p-6 md:p-8"
        >
          <h2 className="mb-6 text-lg font-semibold text-foreground">Table of contents</h2>

          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex items-start gap-3 rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-primary"
                >
                  <span className="mt-0.5 font-mono text-xs font-medium text-primary opacity-60 group-hover:opacity-100">
                    {section.number}
                  </span>

                  <span className="leading-snug">{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Privacy Sections */}
        <div className="space-y-0">
          <PrivacySection id="privacy-section-01" number="01" title="Introduction">
            <p>
              INSIDER (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a digital editorial
              publication operated through{" "}
              <a
                href="https://insider.sudaisazlan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                insider.sudaisazlan.com
              </a>{" "}
              (the &quot;Website&quot;).
            </p>

            <p>
              This Privacy Policy explains how we collect, use, protect, and manage personal
              information when you visit INSIDER, create an account, subscribe to our newsletter,
              submit a contact form, leave a comment, or otherwise interact with our services.
            </p>

            <p>
              INSIDER is designed as a general-audience digital publication serving an international
              audience. Applicable privacy rights and requirements may depend on your location.
            </p>

            <p>
              This Privacy Policy is effective as of <strong>August 19, 2026</strong>.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-02" number="02" title="Information We Collect">
            <p>
              Depending on how you interact with INSIDER, we may collect or process the following
              categories of information:
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Account information:</strong> When you create an account, we may collect
                your email address, first name, last name, profile image, username, and Clerk user
                ID.
              </li>

              <li>
                <strong>Contact form submissions:</strong> When you contact INSIDER, we may collect
                your name, email address, country, and message.
              </li>

              <li>
                <strong>Newsletter subscriptions:</strong> We may collect your email address to
                deliver newsletter communications.
              </li>

              <li>
                <strong>Comments:</strong> When signed-in users leave comments, we may process
                comment content, associated account information, and timestamps.
              </li>

              <li>
                <strong>Analytics information:</strong> Through analytics services, we may receive
                information about website traffic, page views, general usage patterns, visitor
                interactions, browser information, device information, and related technical
                information.
              </li>

              <li>
                <strong>Advertising information:</strong> Through advertising services, we may
                process cookies, browser information, device information, usage information,
                advertising identifiers, or similar technologies where applicable.
              </li>
            </ul>
          </PrivacySection>

          <PrivacySection id="privacy-section-03" number="03" title="How We Use Information">
            <p>We may use information we collect for purposes including:</p>

            <ul className="list-disc space-y-2 pl-5">
              <li>Providing, operating, and maintaining INSIDER</li>
              <li>Managing user accounts and authentication</li>
              <li>Operating and moderating comments</li>
              <li>Delivering newsletters and email communications</li>
              <li>Responding to contact inquiries and requests</li>
              <li>Understanding how readers use our publication</li>
              <li>Improving our editorial products and services</li>
              <li>Supporting advertising and monetization</li>
              <li>Maintaining website security</li>
              <li>Preventing spam, abuse, and fraudulent activity</li>
              <li>Complying with applicable legal obligations</li>
              <li>Enforcing our policies and agreements</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="privacy-section-04" number="04" title="Accounts and Authentication">
            <p>
              INSIDER uses <strong>Clerk</strong> for authentication and account functionality.
              Users may be able to authenticate using supported third-party authentication
              providers, including Google.
            </p>

            <p>
              Information associated with an account may include an email address, first name, last
              name, profile image, username, and Clerk user ID.
            </p>

            <p>
              Third-party authentication providers may process information according to their own
              privacy policies and terms of service. We encourage you to review those policies
              before using third-party authentication.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-section-05"
            number="05"
            title="Comments and User-Provided Content"
          >
            <p>
              Signed-in users may be able to participate in discussions and leave comments on
              INSIDER content.
            </p>

            <p>
              Our comment functionality may process comment content, associated account information,
              timestamps, and information reasonably necessary to operate and moderate discussions.
            </p>

            <p>
              Users may request deletion of their accounts and associated content. Some information
              may need to be retained where required for legal, security, fraud-prevention, or
              legitimate operational purposes.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-section-06"
            number="06"
            title="Public Information and Search Engines"
          >
            <p>
              Information voluntarily made public by users may be visible to other visitors. Public
              comments and other user-provided content may potentially be viewed, copied, shared,
              indexed by search engines, cached, or archived by third parties.
            </p>

            <p>
              INSIDER cannot control independent third-party copies, caches, search-engine indexes,
              or archives. Private account information does not automatically become public.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-07" number="07" title="Newsletter">
            <p>
              INSIDER may offer newsletter functionality for readers who want editorial updates,
              stories, announcements, or other communications.
            </p>

            <p>
              Newsletter subscriptions may require your email address. Email delivery may be
              provided through third-party email services such as <strong>Resend</strong>.
            </p>

            <p>
              You can unsubscribe from newsletter communications at any time using the unsubscribe
              mechanism included in our emails or by contacting us.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-08" number="08" title="Contact Form">
            <p>
              When you use the INSIDER contact form, we may collect your first name, last name,
              email address, country, and message.
            </p>

            <p>
              Contact information may be used to respond to inquiries, editorial suggestions,
              corrections, feedback, partnership requests, or other communications sent to INSIDER.
            </p>

            <p>
              Contact submissions may be stored in our application database and may be processed
              through third-party infrastructure and email services where necessary to operate the
              contact system.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-section-09"
            number="09"
            title="Cookies and Similar Technologies"
          >
            <p>INSIDER may use cookies and similar technologies for purposes including:</p>

            <ul className="list-disc space-y-2 pl-5">
              <li>Essential website functionality</li>
              <li>Authentication and account sessions</li>
              <li>Analytics and audience measurement</li>
              <li>Advertising and monetization</li>
              <li>Security and abuse prevention</li>
              <li>Applicable preferences</li>
            </ul>

            <p>
              Cookie names, durations, and exact identifiers may change as services and
              infrastructure evolve. We do not claim that every cookie or similar technology is
              controlled directly by INSIDER.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-section-10"
            number="10"
            title="Cookie Preferences and Controls"
          >
            <p>
              Cookie requirements and consent obligations can vary depending on your jurisdiction.
            </p>

            <p>
              Where applicable, INSIDER may implement or update consent and preference controls to
              support relevant legal requirements.
            </p>

            <p>
              You can also manage cookies through your browser or device settings. Blocking or
              deleting certain cookies may affect some website functionality.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-11" number="11" title="Analytics">
            <p>
              INSIDER may use <strong>Google Analytics</strong> to understand how readers interact
              with our publication.
            </p>

            <p>
              Analytics information may include page views, traffic sources, general usage patterns,
              device or browser information, and other technical information provided by the
              analytics service.
            </p>

            <p>
              We do not claim that analytics information is completely anonymous or that INSIDER
              directly sees every piece of information that an analytics provider may process.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-12" number="12" title="Advertising">
            <p>
              INSIDER may use <strong>Google AdSense</strong> and other advertising technologies to
              support the publication.
            </p>

            <p>
              Advertising services may use cookies, similar technologies, browser information,
              device information, usage information, advertising identifiers, or related
              technologies where applicable.
            </p>

            <p>
              Advertising may be personalized or non-personalized depending on applicable
              circumstances, user settings, location, consent, and the policies of the advertising
              provider.
            </p>

            <p>
              INSIDER does not personally select every advertisement that appears on the Website.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-13" number="13" title="Third-Party Service Providers">
            <p>
              INSIDER may rely on third-party providers to operate and maintain different parts of
              the publication.
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Clerk</strong> — Authentication and account functionality
              </li>
              <li>
                <strong>Google</strong> — Authentication and related services
              </li>
              <li>
                <strong>Google Analytics</strong> — Website analytics and audience measurement
              </li>
              <li>
                <strong>Google AdSense</strong> — Advertising
              </li>
              <li>
                <strong>Resend</strong> — Email delivery
              </li>
              <li>
                <strong>Vercel</strong> — Hosting and deployment infrastructure
              </li>
              <li>
                <strong>Amazon Web Services</strong> — Cloud and infrastructure services where
                applicable
              </li>
            </ul>

            <p>
              Third-party providers may process information according to their own privacy policies
              and agreements.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-14" number="14" title="International Data Processing">
            <p>
              INSIDER is operated from Pakistan and serves readers and users internationally. Some
              service providers or infrastructure providers may process information outside
              Pakistan.
            </p>

            <p>
              International processing may be subject to applicable laws, contractual safeguards,
              provider practices, or other legally recognized safeguards where applicable.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-15" number="15" title="Third-Party Links">
            <p>
              INSIDER articles and pages may contain links to external websites, publications,
              products, services, or other resources.
            </p>

            <p>
              External websites operate independently from INSIDER and may have their own privacy
              policies, terms, cookies, and data practices.
            </p>

            <p>
              We encourage you to review the privacy policies of external websites before providing
              them with personal information.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-16" number="16" title="Embedded Content">
            <p>
              INSIDER may include embedded content or third-party media in articles and pages where
              appropriate.
            </p>

            <p>
              Embedded content may behave similarly to content hosted directly on another website.
              Third-party services may collect information, use cookies, or track interactions
              according to their own policies.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-17" number="17" title="Data Retention">
            <p>
              INSIDER does not apply one fixed retention period to every category of information.
            </p>

            <p>Information may be retained for as long as reasonably necessary for:</p>

            <ul className="list-disc space-y-2 pl-5">
              <li>Providing our services</li>
              <li>Maintaining user accounts</li>
              <li>Responding to inquiries</li>
              <li>Operating comments and discussions</li>
              <li>Managing newsletter subscriptions</li>
              <li>Maintaining security</li>
              <li>Preventing abuse and fraud</li>
              <li>Meeting legal obligations</li>
              <li>Resolving disputes</li>
              <li>Enforcing agreements and policies</li>
            </ul>

            <p>
              Information may be deleted, anonymized, or otherwise disposed of when it is no longer
              reasonably necessary, where appropriate and legally permitted.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-18" number="18" title="Data Security">
            <p>
              INSIDER uses reasonable technical and organizational safeguards designed to protect
              personal information against unauthorized access, misuse, alteration, loss, or
              disclosure.
            </p>

            <p>
              However, no internet-based service can guarantee absolute security. We do not claim
              that information transmitted or stored online is completely risk-free.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-19" number="19" title="Security Incidents">
            <p>
              While we use reasonable safeguards designed to protect information, security incidents
              can occur in online systems.
            </p>

            <p>
              If INSIDER becomes aware of a security incident involving personal information, we
              will take appropriate steps consistent with applicable requirements and the
              circumstances of the incident.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-20" number="20" title="Your Privacy Rights">
            <p>
              Privacy rights vary depending on where you live and which laws apply to the processing
              of your information.
            </p>

            <p>Where applicable, your rights may include:</p>

            <ul className="list-disc space-y-2 pl-5">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your information</li>
              <li>Objection to certain processing</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Withdrawal of consent where processing relies on consent</li>
            </ul>

            <p>
              We do not claim that every right applies to every user. The rights available to you
              depend on your jurisdiction and the specific circumstances of the processing.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-section-21"
            number="21"
            title="Access and Correction Requests"
          >
            <p>
              If you want to request access to, correction of, or information about your personal
              data, you can contact INSIDER through the contact information provided on our Website.
            </p>

            <p>
              We may reasonably verify your identity before processing certain privacy-related
              requests.
            </p>

            <p>
              Requests may be subject to applicable legal limitations, security requirements, and
              legitimate operational needs.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-22" number="22" title="Account and Data Deletion">
            <p>
              Users may request deletion of their INSIDER account and associated personal
              information where applicable.
            </p>

            <p>
              Account deletion may be subject to identity verification, legal obligations, security
              requirements, dispute resolution needs, fraud prevention, or legitimate recordkeeping
              requirements.
            </p>

            <p>We therefore do not promise immediate deletion in every circumstance.</p>
          </PrivacySection>

          <PrivacySection id="privacy-section-23" number="23" title="Children's Privacy">
            <p>
              INSIDER is a general-audience digital publication. It is not specifically directed
              toward children.
            </p>

            <p>
              We do not knowingly design our services as a dedicated children&apos;s service. If you
              believe that personal information has been provided inappropriately by a child, please
              contact us so that we can review the situation.
            </p>
          </PrivacySection>

          <PrivacySection id="privacy-section-24" number="24" title="Data Sharing">
            <p>
              Personal information may be processed by service providers when reasonably necessary
              for authentication, hosting, infrastructure, email delivery, analytics, advertising,
              security, website operations, and related services.
            </p>

            <p>
              INSIDER may also disclose information where required by law, legal process, security
              requirements, or to protect the rights, safety, and integrity of INSIDER, our users,
              or others.
            </p>

            <p>We do not claim that personal information is never shared under any circumstance.</p>
          </PrivacySection>

          <PrivacySection id="privacy-section-25" number="25" title="User Choices">
            <p>You may have several choices regarding your information:</p>

            <ul className="list-disc space-y-2 pl-5">
              <li>Manage cookies through your browser or available consent controls</li>
              <li>Unsubscribe from INSIDER newsletters at any time</li>
              <li>Request access, correction, or deletion where applicable</li>
              <li>Manage your account information through available account settings</li>
              <li>Contact INSIDER regarding privacy questions or concerns</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="privacy-section-26" number="26" title="Legal and Business Operations">
            <p>
              Information may be processed for purposes including website operation, authentication,
              account management, comments, newsletter delivery, contact requests, analytics,
              advertising, security, spam and fraud prevention, service improvement, legal
              compliance, and enforcement of applicable policies.
            </p>

            <p>
              The legal basis for processing may vary depending on the particular processing
              activity and applicable law.
            </p>
          </PrivacySection>

          <PrivacySection
            id="privacy-section-27"
            number="27"
            title="Changes to This Privacy Policy"
          >
            <p>
              INSIDER may update this Privacy Policy when our services, features, technologies, data
              practices, third-party providers, or legal requirements change.
            </p>

            <p>
              We encourage you to review this page periodically. The &quot;Last updated&quot; date
              at the top of this page indicates when this policy was most recently revised.
            </p>

            <p>
              <strong>Last updated: August 19, 2026</strong>
            </p>
          </PrivacySection>
        </div>

        {/* Contact CTA */}
        <section className="mt-16 rounded-2xl bg-primary p-8 text-primary-foreground md:mt-20 md:p-12">
          <span className="mb-3 block text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
            Privacy questions
          </span>

          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Questions about your privacy?
          </h2>

          <p className="mt-4 max-w-xl leading-relaxed text-primary-foreground/90">
            If you have questions about this Privacy Policy, want to exercise an applicable privacy
            right, or need help understanding how INSIDER handles information, please get in touch
            with our team.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-primary-foreground px-5 py-2.5 text-sm font-medium text-primary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-primary-foreground"
            >
              Contact INSIDER
            </Link>

            <a
              href="https://insider.sudaisazlan.com/"
              className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/30 px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-primary-foreground"
            >
              Visit INSIDER
            </a>
          </div>
        </section>

        {/* Final legal note */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This Privacy Policy describes INSIDER&apos;s current privacy practices and is provided
            for informational purposes. It does not replace professional legal advice where such
            advice is required.
          </p>
        </div>
      </article>
    </main>
  );
}
