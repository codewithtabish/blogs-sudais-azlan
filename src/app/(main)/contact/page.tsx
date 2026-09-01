import type { Metadata } from "next";

import "leaflet/dist/leaflet.css";
import { ContactInformation } from "@/components/app/pages/contact/contact-form-information";
import { ContactForm } from "@/components/app/pages/contact/contact-form";
import { Container } from "@/components/app/general/layouts/container";
import { ContactMap } from "@/components/app/pages/contact/contact-map";

// ============================================================
// SITE CONFIG
// ============================================================

const siteUrl = "https://www.insider.com";

const pageTitle = "Contact INSIDER — Get in Touch";

const pageDescription =
  "Contact INSIDER for questions, story ideas, corrections, partnerships, advertising inquiries, and other editorial conversations.";

// ============================================================
// METADATA
// ============================================================

export const metadata: Metadata = {
  title: pageTitle,

  description: pageDescription,

  alternates: {
    canonical: `${siteUrl}/contact`,
  },

  openGraph: {
    type: "website",
    url: `${siteUrl}/contact`,
    siteName: "INSIDER",
    title: pageTitle,
    description: pageDescription,

    images: [
      {
        url: `${siteUrl}/images/og/insider-og.png`,
        width: 1200,
        height: 630,
        alt: "INSIDER — Technology, AI, Business, Science & More",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [`${siteUrl}/images/og/insider-og.png`],
  },
};

// ============================================================
// PAGE
// ============================================================

export default function ContactPage() {
  return (
    <main>
      <Container>
        <div className="space-y-20 py-16 sm:space-y-24 sm:py-20 lg:space-y-28 lg:py-24">
          {/* ================================================== */}
          {/* HERO */}
          {/* ================================================== */}

          <section aria-labelledby="contact-page-title">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Contact INSIDER
              </p>

              <h1
                id="contact-page-title"
                className="max-w-5xl text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
              >
                Let&apos;s start a conversation.
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                Have a question, story idea, correction, partnership opportunity, advertising
                inquiry, or something else you would like to share with the INSIDER team? We&apos;d
                love to hear from you.
              </p>
            </div>
          </section>

          {/* ================================================== */}
          {/* CONTACT FORM + INFORMATION */}
          {/* ================================================== */}

          <section
            aria-labelledby="contact-form-title"
            className="grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-20 xl:gap-28"
          >
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Send a message
                </p>

                <h2
                  id="contact-form-title"
                  className="text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl"
                >
                  Tell us what&apos;s on your mind.
                </h2>

                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  Whether you have feedback about a story, want to suggest a topic, need to report
                  an error, or would like to work with INSIDER, send us a message and our team will
                  take a look.
                </p>
              </div>

              <ContactForm />
            </div>

            <aside
              aria-label="INSIDER contact information"
              className="lg:border-l lg:border-border lg:pl-10 xl:pl-14"
            >
              <ContactInformation />
            </aside>
          </section>

          {/* ================================================== */}
          {/* EDITORIAL CONTACT */}
          {/* ================================================== */}

          <section
            aria-labelledby="editorial-contact-title"
            className="border-y border-border py-12 md:py-16"
          >
            <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Editorial
                </p>

                <h2
                  id="editorial-contact-title"
                  className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl"
                >
                  Help us make INSIDER better.
                </h2>
              </div>

              <div className="lg:col-span-2 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-foreground">Story ideas</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Have a topic, trend, technology, company, or idea that you think deserves
                    attention? Send it our way.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">Corrections & feedback</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    If you spot an error or believe something in one of our stories needs
                    clarification, please let us know.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">Partnerships</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    We are open to thoughtful partnerships with creators, companies, organizations,
                    and technology teams.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">Advertising</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    For advertising, sponsorship, and commercial opportunities, contact the INSIDER
                    team through the form above.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* LOCATION */}
          {/* ================================================== */}

          <section aria-labelledby="location-title" className="space-y-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end lg:gap-12">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Our location
                </p>

                <h2
                  id="location-title"
                  className="text-2xl font-semibold tracking-[-0.025em] text-foreground sm:text-3xl"
                >
                  Where we&apos;re based
                </h2>
              </div>

              <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">
                INSIDER is an independent digital publication built from Pakistan and created for
                readers everywhere.
              </p>
            </div>

            <ContactMap />
          </section>

          {/* ================================================== */}
          {/* FINAL MESSAGE */}
          {/* ================================================== */}

          <section
            aria-labelledby="contact-final-title"
            className="border-t border-border pt-12 md:pt-16"
          >
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Stay connected
              </p>

              <h2
                id="contact-final-title"
                className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl"
              >
                Have an idea worth sharing?
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                INSIDER is built around curiosity, useful information, and ideas that help people
                understand the world around them. If you have something that belongs in that
                conversation, we want to hear from you.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
