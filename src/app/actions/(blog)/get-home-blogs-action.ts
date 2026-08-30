"use server";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

export type HomeBlogListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  type: "ARTICLE" | "NEWS" | "OPINION" | "ANALYSIS" | "GUIDE" | "REVIEW" | "INTERVIEW";
  bannerImage: string;
  bannerImageAlt: string | null;
  featured: boolean;
  publishedAt: Date | null;
  readingTime: number | null;

  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };

  category: {
    id: string;
    name: string;
    slug: string;
  };

  subcategory: {
    id: string;
    name: string;
    slug: string;
  };
};

type GetHomeBlogsResult =
  | {
      success: true;
      blogs: HomeBlogListItem[];
    }
  | {
      success: false;
      error: string;
    };

async function getCachedHomeBlogs() {
  "use cache";

  cacheLife("max");
  cacheTag(CACHE_TAGS.home);

  return prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: {
        not: null,
        lte: new Date(),
      },
    },

    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      type: true,
      bannerImage: true,
      bannerImageAlt: true,
      featured: true,
      publishedAt: true,
      readingTime: true,

      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      subcategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },

    orderBy: {
      publishedAt: "desc",
    },

    take: 25,
  });
}

export async function getHomeBlogsAction(): Promise<GetHomeBlogsResult> {
  try {
    const blogs = await getCachedHomeBlogs();

    return {
      success: true,
      blogs,
    };
  } catch (err) {
    console.error("[getHomeBlogsAction] Error:", err);

    return {
      success: false,
      error: "Failed to load home blogs.",
    };
  }
}
