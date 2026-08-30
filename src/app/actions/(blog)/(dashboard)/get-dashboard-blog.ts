"use server";

import { Prisma } from "@/generated/prisma/browser";
import prisma from "@/lib/prisma-client";

// ============================================================
// SELECT
// ============================================================
const blogListSelect = {
  id: true,
  title: true,
  slug: true,
  bannerImage: true,
  bannerImageAlt: true,
  type: true,
  status: true,
  featured: true,
  publishedAt: true,
  scheduledAt: true,
  viewCount: true,
  readingTime: true,
  createdAt: true,
  updatedAt: true,

  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
    },
  },

  category: {
    select: { id: true, name: true, slug: true },
  },

  subcategory: {
    select: { id: true, name: true, slug: true },
  },

  _count: {
    select: { comments: true },
  },
} satisfies Prisma.BlogSelect;

export type BlogListItem = Prisma.BlogGetPayload<{
  select: typeof blogListSelect;
}>;

// ============================================================
// INPUT / OUTPUT TYPES
// ============================================================
export type BlogStatusFilter =
  "ALL" | "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export type BlogTypeFilter =
  "ALL" | "ARTICLE" | "NEWS" | "OPINION" | "ANALYSIS" | "GUIDE" | "REVIEW" | "INTERVIEW";

export type BlogSortBy = "createdAt" | "publishedAt" | "viewCount" | "title";
export type SortOrder = "asc" | "desc";

export interface GetBlogsInput {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: BlogStatusFilter;
  type?: BlogTypeFilter;
  categoryId?: string;
  subcategoryId?: string;
  featured?: boolean;
  sortBy?: BlogSortBy;
  sortOrder?: SortOrder;
}

export interface BlogsPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type GetBlogsResult =
  | {
      success: true;
      data: {
        blogs: BlogListItem[];
        pagination: BlogsPagination;
      };
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// DEFAULTS / GUARDS
// ============================================================
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function buildWhere(input: GetBlogsInput): Prisma.BlogWhereInput {
  const where: Prisma.BlogWhereInput = {};

  if (input.search?.trim()) {
    const term = input.search.trim();
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { shortDescription: { contains: term, mode: "insensitive" } },
    ];
  }

  if (input.status && input.status !== "ALL") {
    where.status = input.status;
  }

  if (input.type && input.type !== "ALL") {
    where.type = input.type;
  }

  if (input.categoryId) {
    where.categoryId = input.categoryId;
  }

  if (input.subcategoryId) {
    where.subcategoryId = input.subcategoryId;
  }

  if (typeof input.featured === "boolean") {
    where.featured = input.featured;
  }

  return where;
}

function buildOrderBy(
  sortBy: BlogSortBy,
  sortOrder: SortOrder,
): Prisma.BlogOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

// ============================================================
// CACHED READ
// ============================================================
async function getCachedBlogs(
  where: Prisma.BlogWhereInput,
  orderBy: Prisma.BlogOrderByWithRelationInput,
  skip: number,
  take: number,
) {
  // "use cache";

  // cacheLife("max");
  // cacheTag(CACHE_TAGS.blogsList);

  const [blogs, totalCount] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy,
      skip,
      take,
      select: blogListSelect,
    }),
    prisma.blog.count({ where }),
  ]);

  return { blogs, totalCount };
}

// ============================================================
// GET BLOGS ACTION
// ============================================================
export async function getDashboardBlogsAction(input: GetBlogsInput = {}): Promise<GetBlogsResult> {
  try {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));
    const sortBy = input.sortBy ?? "createdAt";
    const sortOrder = input.sortOrder ?? "desc";

    const where = buildWhere(input);
    const orderBy = buildOrderBy(sortBy, sortOrder);
    const skip = (page - 1) * pageSize;

    const { blogs, totalCount } = await getCachedBlogs(where, orderBy, skip, pageSize);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("[getBlogsAction] Error:", error);
    return {
      success: false,
      error: "Failed to load blogs.",
    };
  }
}
