import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getSubcategoryPageBlogsAction } from "@/app/actions/(category)/get-top-subcategory-blogs-action";
import { SubcategoryBlogSkeleton } from "@/components/app/pages/subcategorypage/subcategory-blog-skeleton";
import { SubcategoryBlogData } from "@/components/app/pages/subcategorypage/subcategory-blog-data";

type PageProps = {
  params: Promise<{
    slug: string;
    subcategory: string;
  }>;
};

const siteUrl = "https://www.alentah.com";
const siteName = "Alentah";
const ogImage = `${siteUrl}/images/og/alentah-og.png`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: categorySlug, subcategory: subcategorySlug } = await params;

  const result = await getSubcategoryPageBlogsAction(subcategorySlug);

  if (!result.success) {
    return {
      title: `Subcategory Not Found | ${siteName}`,
      description: `The requested subcategory could not be found on ${siteName}.`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const subcategory = result.data;

  const categoryName = subcategory.category.name;
  const subcategoryName = subcategory.name;

  const title = `${subcategoryName} — Latest News, Guides & Insights`;

  const description =
    subcategory.description?.trim() ||
    `Explore the latest ${subcategoryName.toLowerCase()} news, guides, analysis, reviews, and insights from ${categoryName} on ${siteName}.`;

  const canonicalUrl = `${siteUrl}/${categorySlug}/${subcategorySlug}`;

  return {
    metadataBase: new URL(siteUrl),

    title: {
      absolute: title,
    },

    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${subcategoryName} | ${siteName}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { slug: categorySlug, subcategory: subcategorySlug } = await params;

  const result = await getSubcategoryPageBlogsAction(subcategorySlug);

  if (!result.success) {
    notFound();
  }

  return (
    <main>
      <Suspense
        key={`${categorySlug}-${subcategorySlug}`}
        fallback={
          <div className="pb-12 pt-10 sm:pb-16 sm:pt-12">
            <SubcategoryBlogSkeleton />
          </div>
        }
      >
        <SubcategoryBlogData categorySlug={categorySlug} subcategorySlug={subcategorySlug} />
      </Suspense>
    </main>
  );
}
