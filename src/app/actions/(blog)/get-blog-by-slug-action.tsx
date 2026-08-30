"use server";

import { cacheLife, cacheTag } from "next/cache";

import { Prisma } from "@/generated/prisma/browser";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

const blogBySlugSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  content: true,
  tableOfContents: true,
  type: true,
  status: true,
  bannerImage: true,
  bannerImageAlt: true,
  featured: true,
  publishedAt: true,
  scheduledAt: true,
  readingTime: true,
  viewCount: true,

  author: true,

  category: true,

  subcategory: true,

  seo: true,

  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.BlogSelect;

type BlogBySlug = Prisma.BlogGetPayload<{
  select: typeof blogBySlugSelect;
}>;

type GetBlogBySlugResult =
  | {
      success: true;
      blog: BlogBySlug;
    }
  | {
      success: false;
      error: string;
    };

async function getCachedBlogBySlug(slug: string): Promise<BlogBySlug | null> {
  "use cache";

  cacheLife("max");
  cacheTag(CACHE_TAGS.blog(slug));

  return prisma.blog.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: {
        not: null,
        lte: new Date(),
      },
      category: {
        isActive: true,
      },
      subcategory: {
        isActive: true,
      },
    },
    select: blogBySlugSelect,
  });
}

export async function getBlogBySlugAction(slug: string): Promise<GetBlogBySlugResult> {
  try {
    if (!slug?.trim()) {
      return {
        success: false,
        error: "Blog slug is required.",
      };
    }

    const blog = await getCachedBlogBySlug(slug);

    if (!blog) {
      return {
        success: false,
        error: "Blog not found.",
      };
    }

    return {
      success: true,
      blog,
    };
  } catch (err) {
    console.error("[getBlogBySlugAction] Error:", err);

    return {
      success: false,
      error: "Failed to load blog.",
    };
  }
}
