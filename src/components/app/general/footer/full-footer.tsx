// src/components/(app)/(common)/footer/full-footer.tsx

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense, type ComponentType, type ReactNode } from "react";

import { getAllCategoriesAction } from "@/app/actions/(category)/get-all-categories-action";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/app/general/brand/logo";
import { FooterVisibility } from "./footer-visibility";

/* ------------------------------------------------------------------ */
/* Copyright                                                          */
/* ------------------------------------------------------------------ */

const COPYRIGHT_YEAR = "2026";

/* ------------------------------------------------------------------ */
/* Social icons                                                       */
/* ------------------------------------------------------------------ */

type IconProps = {
  className?: string;
};

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H9.4v2.8h2.4V21" />
    </svg>
  );
}

function YoutubeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.7 9.6v4.8l4.3-2.4-4.3-2.4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.53 2.5h3.2l-7 8 8.24 11h-6.45l-5.05-6.63L4.6 21.5H1.4l7.49-8.56L1 2.5h6.61l4.56 6.06 5.36-6.06Zm-1.12 17.02h1.77L7.66 4.38H5.76l10.65 15.14Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Social links                                                       */
/* ------------------------------------------------------------------ */

type SocialLink = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://instagram.com/insider",
    icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/insider",
    icon: FacebookIcon,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@insider",
    icon: YoutubeIcon,
  },
  {
    label: "X",
    href: "https://x.com/insider",
    icon: XIcon,
  },
];

/* ------------------------------------------------------------------ */
/* Footer links                                                       */
/* ------------------------------------------------------------------ */

const COMPANY_LINKS = [
  {
    label: "About INSIDER",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const LEGAL_LINKS = [
  {
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    label: "Terms of Use",
    href: "/terms",
  },
  {
    label: "Advertise",
    href: "/advertise",
  },
];

/* ------------------------------------------------------------------ */
/* Footer link                                                        */
/* ------------------------------------------------------------------ */

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const className = cn(
    "group inline-flex items-center gap-1",
    "text-sm text-foreground/75",
    "transition-colors duration-200",
    "hover:text-foreground",
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}

        <ArrowUpRight
          className="size-3.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden="true"
        />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}

      <ArrowUpRight
        className="size-3.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Social button                                                      */
/* ------------------------------------------------------------------ */

function SocialButton({ social }: { social: SocialLink }) {
  const Icon = social.icon;

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className={cn(
        "inline-flex size-10 items-center justify-center",
        "rounded-md border border-border",
        "text-foreground/70",
        "transition-all duration-200",
        "hover:border-foreground",
        "hover:bg-foreground",
        "hover:text-background",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
      )}
    >
      <Icon className="size-[18px]" />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Category column helper                                             */
/* ------------------------------------------------------------------ */

function splitCategories<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);

  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });

  return columns;
}

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */

export default async function InsiderFooter() {
  const result = await getAllCategoriesAction();

  const categories = result.success
    ? result.categories
        .filter((category) => category.isActive)
        .map((category) => ({
          ...category,
          subcategories: category.subcategories.filter((subcategory) => subcategory.isActive),
        }))
    : [];

  const categoryColumns = splitCategories(categories, 2);

  return (
    <Suspense fallback={null}>
      <FooterVisibility hideOnPrefixes={["/agent"]}>
        <footer className="border-t border-border bg-background">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
            {/* ==========================================================
                Main footer
            =========================================================== */}

            <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_0.9fr] lg:gap-16 lg:py-16">
              {/* --------------------------------------------------------
                  Brand
              --------------------------------------------------------- */}

              <div className="max-w-[560px]">
                <Logo variant="lockup" size="lg" />

                <p className="mt-7 max-w-[540px] text-[15px] leading-7 text-muted-foreground">
                  INSIDER is an independent editorial publication by{" "}
                  <span className="font-medium text-foreground">CodeWithTabish</span>, exploring
                  technology, AI, programming, ideas, trends, and practical knowledge.
                </p>

                <p className="mt-3 max-w-[540px] text-[15px] leading-7 text-muted-foreground">
                  We make the rapidly changing world of technology easier to understand, explore,
                  and navigate — bringing together useful insights, thoughtful analysis, and
                  practical knowledge for curious minds.
                </p>

                {/* Company links */}

                <nav
                  aria-label="Company"
                  className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
                >
                  {COMPANY_LINKS.map((link) => (
                    <FooterLink key={link.href} href={link.href}>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.13em]">
                        {link.label}
                      </span>
                    </FooterLink>
                  ))}
                </nav>

                {/* Socials */}

                <div className="mt-7 flex items-center gap-2">
                  {SOCIAL_LINKS.map((social) => (
                    <SocialButton key={social.label} social={social} />
                  ))}
                </div>
              </div>

              {/* --------------------------------------------------------
                  Categories
              --------------------------------------------------------- */}

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Explore INSIDER
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-x-8">
                  {categoryColumns.map((column, columnIndex) => (
                    <div key={`category-column-${columnIndex}`} className="space-y-5">
                      {column.map((category) => (
                        <div key={category.id}>
                          <Link
                            href={`/${category.slug}`}
                            className="group inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {category.name}

                            <ArrowUpRight
                              className="size-3.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                              aria-hidden="true"
                            />
                          </Link>

                          {category.subcategories.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {category.subcategories.slice(0, 4).map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  href={`/${category.slug}/${subcategory.slug}`}
                                  className="block text-xs leading-5 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {categories.length === 0 && (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Categories are currently unavailable.
                  </p>
                )}
              </div>

              {/* --------------------------------------------------------
                  Information
              --------------------------------------------------------- */}

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Information
                </h2>

                <nav aria-label="Legal and information" className="mt-6 space-y-4">
                  {LEGAL_LINKS.map((link) => (
                    <FooterLink key={link.href} href={link.href}>
                      {link.label}
                    </FooterLink>
                  ))}
                </nav>

                {/* Publisher card */}

                <div className="mt-10 border-l-2 border-primary/70 pl-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Published by
                  </p>

                  <a
                    href="https://codewithtabish.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
                  >
                    CodeWithTabish
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>

                  <p className="mt-2 max-w-[240px] text-xs leading-5 text-muted-foreground">
                    The organization behind INSIDER, building software, technology products, and
                    digital publishing experiences.
                  </p>
                </div>
              </div>
            </div>

            {/* ==========================================================
                Divider
            =========================================================== */}

            <div className="border-t border-dashed border-border" />

            {/* ==========================================================
                Bottom footer
            =========================================================== */}

            <div className="flex flex-col gap-5 py-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                  © {COPYRIGHT_YEAR} CodeWithTabish. INSIDER. All rights reserved.
                </p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  INSIDER is a publication of CodeWithTabish. All editorial content, trademarks, and
                  third-party materials remain the property of their respective owners where
                  applicable.
                </p>
              </div>

              <a
                href="https://codewithtabish.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Published by CodeWithTabish
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </footer>
      </FooterVisibility>
    </Suspense>
  );
}
