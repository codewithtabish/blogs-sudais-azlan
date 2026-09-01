import {
  ArrowUpRight,
  BadgeCheck,
  Bot,
  FileText,
  Handshake,
  Mail,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Container } from "../../general/layouts/container";

const CONTACT_EMAIL = "tabish@codewithtabish.com";
const WHATSAPP_URL = "https://wa.me/923169000919";

const opportunities = [
  {
    icon: FileText,
    title: "Sponsored content",
    description:
      "A paid article or content collaboration created around an agreed promotional objective. Sponsored content is clearly identified for readers.",
  },
  {
    icon: Sparkles,
    title: "Product & tool promotion",
    description:
      "Promotional opportunities for relevant software, AI tools, apps, products, and services may be considered depending on editorial fit.",
  },
  {
    icon: Megaphone,
    title: "Brand campaigns",
    description:
      "Custom campaigns can be discussed around an agreed objective, audience, format, timing, and scope.",
  },
  {
    icon: BadgeCheck,
    title: "Sponsored reviews",
    description:
      "Review or evaluation opportunities may be considered where appropriate. Payment does not guarantee a positive review or editorial outcome.",
  },
  {
    icon: MessageCircle,
    title: "Newsletter opportunities",
    description:
      "Newsletter promotional opportunities may be available depending on the campaign, format, timing, and available inventory.",
  },
  {
    icon: Handshake,
    title: "Custom partnerships",
    description:
      "Have another idea? Suitable custom promotional arrangements can be discussed for relevant products, projects, and organizations.",
  },
];

const audiences = [
  "Companies",
  "Startups",
  "Technology brands",
  "Software companies",
  "AI companies",
  "Developers",
  "Creators",
  "Agencies",
  "Organizations",
  "Individuals with relevant products or projects",
];

const fitAreas = [
  "Artificial intelligence",
  "Software",
  "Technology",
  "Robotics",
  "Productivity",
  "Creativity",
  "Developer tools",
  "Emerging technology",
  "Digital culture",
];

const process = [
  {
    number: "01",
    title: "Tell us about it",
    description:
      "Contact INSIDER and explain what you want to promote, who it is for, and what you have in mind.",
  },
  {
    number: "02",
    title: "We review it",
    description:
      "INSIDER reviews the request for relevance, quality, audience fit, and suitability.",
  },
  {
    number: "03",
    title: "We agree on the details",
    description:
      "If the opportunity is a good fit, both sides can discuss format, timing, scope, pricing, disclosure, and other relevant terms.",
  },
  {
    number: "04",
    title: "We launch",
    description:
      "Once the arrangement is agreed upon, the approved promotional activity can proceed according to the agreed terms.",
  },
];

export function AdvertisePage() {
  return (
    <Container className="overflow-hidden">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl py-20 sm:py-24 lg:py-32">
          <Badge
            variant="outline"
            className="mb-6 gap-2 rounded-full px-3 py-1 text-xs font-medium tracking-[0.16em]"
          >
            <Megaphone className="size-3.5 text-primary" aria-hidden="true" />
            ADVERTISE WITH INSIDER
          </Badge>

          <h1 className="max-w-5xl text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Put your product in front of curious technology readers.
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
            INSIDER works with relevant brands, products, tools, services, creators, startups, and
            organizations on promotional opportunities that fit our technology-focused publication.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group">
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="size-4" aria-hidden="true" />
                Start a conversation
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="#opportunities">Explore opportunities</Link>
            </Button>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
            Every advertising and partnership request is subject to review and approval by INSIDER.
            An inquiry does not guarantee acceptance, publication, or any particular result.
          </p>
        </div>
      </section>

      {/* Why INSIDER */}
      <section>
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
                Why work with INSIDER?
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A professional environment for relevant technology stories.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              {[
                {
                  icon: Sparkles,
                  title: "Relevant context",
                  text: "Promote technology-related products in an environment built around technology coverage, ideas, and emerging tools.",
                },
                {
                  icon: FileText,
                  title: "Editorial presentation",
                  text: "Promotional opportunities can be presented within a polished editorial environment with appropriate disclosure.",
                },
                {
                  icon: Handshake,
                  title: "Flexible partnerships",
                  text: "Discuss campaigns based on the product, audience, goals, timing, and formats that may be available.",
                },
                {
                  icon: Mail,
                  title: "Direct communication",
                  text: "Talk directly with the INSIDER team rather than relying only on automated advertising systems.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="bg-background p-6 sm:p-7">
                    <Icon className="size-5 text-primary" aria-hidden="true" />

                    <h3 className="mt-5 text-base font-semibold">{item.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Opportunities */}
      <section id="opportunities" className="scroll-mt-20">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
              Opportunities
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Ways to work with INSIDER
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              These are examples of promotional opportunities that may be discussed. Availability,
              format, scope, and suitability are considered individually.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="rounded-2xl border-border bg-card shadow-none">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>

                    <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who can work with us */}
      <section className="border-y border-border bg-muted/30">
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
              Who can contact us?
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Relevant ideas can come from anywhere.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted-foreground">
              We welcome inquiries from organizations and individuals with relevant products,
              services, projects, or promotional ideas. Every request is considered based on
              relevance, quality, audience fit, and INSIDER&apos;s editorial standards.
            </p>
          </div>

          <div className="grid content-start gap-x-8 gap-y-3 sm:grid-cols-2">
            {audiences.map((audience) => (
              <div key={audience} className="flex items-start gap-3 border-b border-border/70 py-3">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />

                <span className="text-sm leading-6">{audience}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial fit */}
      <section>
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
                Editorial fit
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Looking for a good fit
              </h2>
            </div>

            <div>
              <p className="text-base leading-7 text-muted-foreground">
                INSIDER is particularly interested in products, services, and projects connected to
                technology and emerging ideas. Relevance is important, but it does not automatically
                guarantee approval.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {fitAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="rounded-full px-3 py-1.5 font-normal"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Process */}
      <section>
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
              The process
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From first conversation to launch.
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Direct partnerships are discussed individually. No payment or commercial arrangement
              guarantees publication or editorial approval.
            </p>
          </div>

          <div className="mt-12 grid gap-0 border-y border-border md:grid-cols-4 md:divide-x md:divide-border">
            {process.map((step, index) => (
              <div key={step.number} className="relative py-7 md:px-6 lg:px-7">
                {index !== 0 && (
                  <div className="absolute inset-x-0 top-0 h-px bg-border md:hidden" />
                )}

                <span className="text-sm font-semibold tracking-[0.14em] text-primary">
                  {step.number}
                </span>

                <h3 className="mt-5 text-base font-semibold">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />

            <p>
              <span className="font-medium">Important:</span> submitting an inquiry does not
              guarantee acceptance. Commercial terms, including pricing and payment arrangements,
              are agreed directly with INSIDER for approved opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial independence */}
      <section className="border-y border-border bg-muted/30">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Advertising does not buy editorial approval.
            </h2>

            <div className="mt-6 grid gap-6 text-base leading-7 text-muted-foreground md:grid-cols-2">
              <p>
                Paid promotional relationships should be disclosed appropriately so readers can
                distinguish advertising from ordinary editorial content.
              </p>

              <p>
                An advertising arrangement does not automatically guarantee positive editorial
                coverage, favorable opinions, or a particular outcome.
              </p>

              <p>
                INSIDER may decline promotional requests that do not fit its audience, quality
                expectations, or editorial standards.
              </p>

              <p>
                Where applicable, editorial decisions should remain separate from commercial
                arrangements. This helps preserve trust with both readers and partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclosure */}
      <section>
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border p-6 sm:p-8 lg:p-10">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Clear disclosure</h2>

                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  When content is sponsored or paid for, INSIDER may identify it with clear labels
                  such as <span className="font-medium text-foreground">Sponsored</span>,{" "}
                  <span className="font-medium text-foreground">Advertisement</span>, or{" "}
                  <span className="font-medium text-foreground">Paid promotion</span>. Appropriate
                  disclosure helps readers understand when content is part of a commercial
                  relationship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense */}
      <section className="border-y border-border">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
                Separate systems
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                What about Google ads?
              </h2>
            </div>

            <div className="space-y-5 text-base leading-7 text-muted-foreground">
              <p>
                Google AdSense is a separate advertising system. Google may automatically display
                advertisements on INSIDER through its advertising platform.
              </p>

              <p>
                Direct advertising inquiries on this page are not requests to control or purchase
                Google AdSense advertisements. INSIDER does not manually negotiate each AdSense
                advertisement through this page.
              </p>

              <p>
                If you want to discuss a direct promotional campaign, sponsored content opportunity,
                or commercial partnership with INSIDER, contact the team directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Review standards + pricing */}
      <section>
        <div className="grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
              Review standards
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Some promotions may not be a fit.
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              INSIDER may decline promotions that are irrelevant to its audience, misleading,
              deceptive, potentially harmful, illegal, or inconsistent with its policies and
              standards.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">Pricing</p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Discuss the right opportunity.
            </h2>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Advertising opportunities are discussed individually based on the format, scope,
              placement, duration, and campaign requirements. There are no fixed advertising
              packages or prices published here.
            </p>

            <Button asChild className="mt-6">
              <a href={`mailto:${CONTACT_EMAIL}`}>
                Ask about advertising
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border bg-primary/5">
        <div className="py-16 sm:py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
            <div className="max-w-3xl">
              <Badge
                variant="outline"
                className="rounded-full border-primary/20 bg-background px-3 py-1 text-primary"
              >
                Direct partnerships
              </Badge>

              <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Let&apos;s talk about your campaign.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                If you have a product, service, brand, project, or promotional idea that may be a
                good fit for INSIDER, get in touch and tell us what you have in mind.
              </p>

              <div className="mt-8">
                <p className="text-sm font-medium">Helpful information to include</p>

                <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
                  <li>• Your name or organization</li>
                  <li>• Product or service</li>
                  <li>• Website</li>
                  <li>• What you want to promote</li>
                  <li>• Desired campaign type</li>
                  <li>• Approximate timing</li>
                  <li>• Relevant campaign goals</li>
                </ul>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-border bg-background p-6 sm:p-7 lg:w-[360px]">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                General / Advertising
              </p>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-2 block break-all text-base font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {CONTACT_EMAIL}
              </a>

              <Separator className="my-5" />

              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Privacy
              </p>

              <a
                href="mailto:codewithtabish.com"
                className="mt-2 block break-all text-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                codewithtabish.com
              </a>

              <Separator className="my-5" />

              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Phone / WhatsApp
              </p>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                +92 316 9000919
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Button asChild>
                  <a href={`mailto:${CONTACT_EMAIL}`}>
                    <Mail className="size-4" aria-hidden="true" />
                    Email INSIDER
                  </a>
                </Button>

                <Button asChild variant="outline">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" aria-hidden="true" />
                    WhatsApp us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing trust statement */}
      <section>
        <div className="flex flex-col gap-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-primary" aria-hidden="true" />
            <span>Technology, ideas, and emerging possibilities.</span>
          </div>

          <p>Commercial partnerships are subject to INSIDER&apos;s review and approval.</p>
        </div>
      </section>
    </Container>
  );
}
