import type { Metadata } from "next";
import { Suspense } from "react";

import { getBlogBySlugAction } from "@/app/actions/(blog)/get-blog-by-slug-action";
import { BlogPostSkeleton } from "@/components/app/pages/blog/blog-page-skeleton";
import { BlogPostData } from "@/components/app/pages/blog/blog-page-data";

type PageProps = {
  params: Promise<{
    slug: string;
    subcategory: string;
    blogslug: string;
  }>;
};

const siteUrl = "https://www.alentah.com";
const siteName = "Alentah";
const defaultOgImage = `${siteUrl}/images/og/alentah-og.png`;

// ============================================================
// SEO METADATA
// ============================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { blogslug } = await params;

  const result = await getBlogBySlugAction(blogslug);

  // ==========================================================
  // BLOG NOT FOUND
  // ==========================================================

  if (!result.success || !result.blog) {
    return {
      metadataBase: new URL(siteUrl),
      title: "Article Not Found | Alentah",
      description: "The requested article could not be found on Alentah.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const blog = result.blog;

  // ==========================================================
  // BASIC SEO VALUES
  // ==========================================================

  const title = blog.seo?.metaTitle?.trim() || blog.title;

  const description =
    blog.seo?.metaDescription?.trim() ||
    blog.shortDescription?.trim() ||
    `Read ${blog.title} on ${siteName}.`;

  // ==========================================================
  // CANONICAL URL
  // ==========================================================

  const canonicalUrl =
    blog.seo?.canonicalUrl?.trim() ||
    `${siteUrl}/${blog.category.slug}/${blog.subcategory.slug}/${blog.slug}`;

  // ==========================================================
  // OPEN GRAPH
  // ==========================================================

  const ogTitle = blog.seo?.ogTitle?.trim() || title;

  const ogDescription = blog.seo?.ogDescription?.trim() || description;

  const ogImage = blog.seo?.ogImage?.trim() || blog.bannerImage?.trim() || defaultOgImage;

  // ==========================================================
  // TWITTER / X
  // ==========================================================

  const twitterTitle = blog.seo?.twitterTitle?.trim() || ogTitle;

  const twitterDescription = blog.seo?.twitterDescription?.trim() || ogDescription;

  const twitterImage = blog.seo?.twitterImage?.trim() || ogImage;

  // ==========================================================
  // AUTHOR
  // ==========================================================

  const authorName =
    [blog.author?.firstName, blog.author?.lastName].filter(Boolean).join(" ") || siteName;

  // ==========================================================
  // KEYWORDS
  // ==========================================================

  const keywords = blog.tags?.length ? blog.tags.map((item) => item.tag.name) : undefined;

  // ==========================================================
  // METADATA
  // ==========================================================

  return {
    metadataBase: new URL(siteUrl),

    // --------------------------------------------------------
    // BASIC SEO
    // --------------------------------------------------------

    title: {
      absolute: title,
    },

    description,

    keywords,

    authors: [
      {
        name: authorName,
      },
    ],

    creator: authorName,
    publisher: siteName,

    // --------------------------------------------------------
    // CANONICAL
    // --------------------------------------------------------

    alternates: {
      canonical: canonicalUrl,
    },

    // --------------------------------------------------------
    // ROBOTS
    // --------------------------------------------------------

    robots: {
      index: !blog.seo?.noIndex,
      follow: !blog.seo?.noFollow,

      googleBot: {
        index: !blog.seo?.noIndex,
        follow: !blog.seo?.noFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    // --------------------------------------------------------
    // OPEN GRAPH
    // --------------------------------------------------------

    openGraph: {
      type: "article",
      locale: "en_US",
      url: canonicalUrl,
      siteName,

      title: ogTitle,

      description: ogDescription,

      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: blog.bannerImageAlt?.trim() || blog.title,
        },
      ],

      publishedTime: blog.publishedAt ? blog.publishedAt.toISOString() : undefined,

      authors: [authorName],

      section: blog.category.name,
    },

    // --------------------------------------------------------
    // TWITTER / X
    // --------------------------------------------------------

    twitter: {
      card: "summary_large_image",

      title: twitterTitle,

      description: twitterDescription,

      images: [twitterImage],
    },
  };
}

// ============================================================
// PAGE
// ============================================================

export default async function SingleBlogPage({ params }: PageProps) {
  const { blogslug } = await params;

  return (
    <main>
      <Suspense key={blogslug} fallback={<BlogPostSkeleton />}>
        <BlogPostData blogslug={blogslug} />
      </Suspense>
    </main>
  );
}
