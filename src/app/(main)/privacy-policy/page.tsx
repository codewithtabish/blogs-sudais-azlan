import { PrivacyPolicy } from "@/components/app/pages/privacy-policy/privacy-policy-comp";
import type { Metadata } from "next";

const siteUrl = "https://insider.sudaisazlan.com";

const title = "Privacy Policy | INSIDER";

const description =
  "Learn how INSIDER collects, uses, protects, and manages personal information, cookies, analytics, advertising, accounts, comments, newsletters, and third-party services.";

const ogImage = `${siteUrl}/images/og/insider-og.png`;

export const metadata: Metadata = {
  title,
  description,

  alternates: {
    canonical: `${siteUrl}/privacy`,
  },

  openGraph: {
    type: "website",
    url: `${siteUrl}/privacy`,
    siteName: "INSIDER",
    title,
    description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "INSIDER — Independent Stories, Ideas & Perspectives",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
