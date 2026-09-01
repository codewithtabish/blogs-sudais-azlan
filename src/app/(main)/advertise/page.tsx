import { AdvertisePage } from "@/components/app/pages/advertise/advertise-page-comp";
import type { Metadata } from "next";

const siteUrl = "https://insider.sudaisazlan.com";

export const metadata: Metadata = {
  title: "Advertise | INSIDER",
  description:
    "Explore advertising, sponsored content, product promotion, brand campaigns, and partnership opportunities with INSIDER.",
  alternates: {
    canonical: `${siteUrl}/advertise`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/advertise`,
    siteName: "INSIDER",
    title: "Advertise | INSIDER",
    description:
      "Explore advertising, sponsored content, product promotion, brand campaigns, and partnership opportunities with INSIDER.",
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
    title: "Advertise | INSIDER",
    description:
      "Explore advertising, sponsored content, product promotion, brand campaigns, and partnership opportunities with INSIDER.",
    images: [`${siteUrl}/images/og/insider-og.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <AdvertisePage />;
}
