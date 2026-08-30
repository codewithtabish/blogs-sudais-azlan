"use server";

import { cacheLife, cacheTag } from "next/cache";

import { BlogType } from "@/generated/prisma/enums";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

// ============================================================
// TYPES
// ============================================================

export type SubcategoryBlogAuthor = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export type SubcategoryBlogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type SubcategoryNavigationItem = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type SubcategoryPageCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  /**
   * All active subcategories belonging
   * to this parent category.
   */
  subcategories: SubcategoryNavigationItem[];
};

export type SubcategoryPageBlogItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  bannerImage: string;
  bannerImageAlt: string | null;
  type: BlogType;
  publishedAt: Date | null;
  readingTime: number | null;

  author: SubcategoryBlogAuthor;

  category: SubcategoryBlogCategory;
};

export type SubcategoryPageData = {
  // ==========================================================
  // CURRENT SUBCATEGORY
  // ==========================================================

  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;

  // ==========================================================
  // PARENT CATEGORY
  // ==========================================================

  category: SubcategoryPageCategory;

  // ==========================================================
  // BLOGS
  // ==========================================================

  blogs: SubcategoryPageBlogItem[];
};

type GetSubcategoryPageBlogsResult =
  | {
      success: true;
      data: SubcategoryPageData;
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// CONFIG
// ============================================================

const BLOGS_TAKE = 20;

// ============================================================
// CACHED FETCH
// ============================================================

async function getCachedSubcategoryPageBlogs(slug: string) {
  "use cache";

  cacheLife("max");

  cacheTag(CACHE_TAGS.subcategoryPageBlogs(slug));

  return prisma.subcategory.findUnique({
    where: {
      slug,
      isActive: true,
    },

    select: {
      // ======================================================
      // CURRENT SUBCATEGORY
      // ======================================================

      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      sortOrder: true,

      // ======================================================
      // PARENT CATEGORY
      //
      // This gives us:
      //
      // AI
      // ├── AI News
      // ├── AI Tools
      // ├── Generative AI
      // └── AI Research
      //
      // All in the same query.
      // ======================================================

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,

          // ==================================================
          // ALL ACTIVE SUBCATEGORIES
          // ==================================================

          subcategories: {
            where: {
              isActive: true,
            },

            select: {
              id: true,
              name: true,
              slug: true,
              sortOrder: true,
            },

            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },

      // ======================================================
      // BLOGS
      // ======================================================

      blogs: {
        where: {
          status: "PUBLISHED",
        },

        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          bannerImage: true,
          bannerImageAlt: true,
          type: true,
          publishedAt: true,
          readingTime: true,

          // ==================================================
          // AUTHOR
          // ==================================================

          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },

          // ==================================================
          // BLOG CATEGORY
          // ==================================================

          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },

        // ====================================================
        // NEWEST BLOGS FIRST
        // ====================================================

        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],

        take: BLOGS_TAKE,
      },
    },
  });
}

// ============================================================
// ACTION
// ============================================================

export async function getSubcategoryPageBlogsAction(
  slug: string,
): Promise<GetSubcategoryPageBlogsResult> {
  try {
    // ========================================================
    // NORMALIZE SLUG
    // ========================================================

    const normalizedSlug = slug.trim().toLowerCase();

    if (!normalizedSlug) {
      return {
        success: false,
        error: "Subcategory slug is required.",
      };
    }

    // ========================================================
    // FETCH CACHED DATA
    // ========================================================

    const subcategory = await getCachedSubcategoryPageBlogs(normalizedSlug);

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!subcategory) {
      return {
        success: false,
        error: "Subcategory not found.",
      };
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return {
      success: true,

      data: {
        // ====================================================
        // CURRENT SUBCATEGORY
        // ====================================================

        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description,
        isActive: subcategory.isActive,
        sortOrder: subcategory.sortOrder,

        // ====================================================
        // PARENT CATEGORY + ALL SUBCATEGORIES
        // ====================================================

        category: subcategory.category,

        // ====================================================
        // BLOGS
        // ====================================================

        blogs: subcategory.blogs,
      },
    };
  } catch (error) {
    console.error("[getSubcategoryPageBlogsAction] Error:", error);

    return {
      success: false,
      error: "Failed to load subcategory blogs.",
    };
  }
}
