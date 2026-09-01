import TermsPageComp from "@/components/app/pages/terms/terms-page-comp";
import type { Metadata } from "next";

const siteUrl = "https://insider.sudaisazlan.com";

export const metadata: Metadata = {
  title: "Terms of Use | INSIDER",
  description:
    "Read the Terms of Use governing your use of INSIDER, including accounts, content, user submissions, intellectual property, acceptable use, and website services.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/terms`,
    siteName: "INSIDER",
    title: "Terms of Use | INSIDER",
    description:
      "Read the Terms of Use governing your use of INSIDER, including accounts, content, user submissions, intellectual property, acceptable use, and website services.",
    images: [
      {
        url: `${siteUrl}/images/og/insider-og.png`,
        width: 1200,
        height: 630,
        alt: "INSIDER — Technology, AI, Science & More",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use | INSIDER",
    description:
      "Read the Terms of Use governing your use of INSIDER, including accounts, content, user submissions, intellectual property, acceptable use, and website services.",
    images: [`${siteUrl}/images/og/insider-og.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const TermsPage = () => {
  return <TermsPageComp />;
};

export default TermsPage;
