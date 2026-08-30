"use server";

import { cacheLife, cacheTag } from "next/cache";

import { BlogType } from "@/generated/prisma/enums";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

// ============================================================
// TYPES
// ============================================================

export type CategoryBlogAuthor = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export type CategoryBlogSubcategory = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryPageBlogItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  bannerImage: string;
  bannerImageAlt: string | null;
  type: BlogType;
  publishedAt: Date | null;
  readingTime: number | null;
  author: CategoryBlogAuthor;
  subcategory: CategoryBlogSubcategory;
};

export type CategoryPageSubcategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

export type CategoryPageEditor = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  experience: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  github: string | null;
  /** true when no real editor is assigned and this is a placeholder */
  isFake: boolean;
};

export type CategoryPageData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  editor: CategoryPageEditor;
  subcategories: CategoryPageSubcategory[];
  blogs: CategoryPageBlogItem[];
};

type GetTopCategoryPageBlogsResult =
  { success: true; data: CategoryPageData } | { success: false; error: string };

const BLOGS_TAKE = 15;

// Fallback editor shown when a category has no editor assigned yet
const FAKE_EDITOR: Omit<CategoryPageEditor, "isFake"> = {
  id: "fake-editor",
  name: "Editorial Team",
  email: "editorial@example.com",
  imageUrl: null,
  bio: "Curated and reviewed by our editorial team.",
  experience: null,
  location: null,
  website: null,
  twitter: null,
  linkedin: null,
  facebook: null,
  instagram: null,
  github: null,
};

// ============================================================
// CACHED FETCH
// ============================================================

async function getCachedCategoryPageBlogs(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.categoryPageBlogs(slug));

  return prisma.category.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      subcategories: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          sortOrder: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      editor: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          bio: true,
          experience: true,
          location: true,
          website: true,
          twitter: true,
          linkedin: true,
          facebook: true,
          instagram: true,
          github: true,
        },
      },
      blogs: {
        where: { status: "PUBLISHED" },
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
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          subcategory: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { publishedAt: "desc" },
        take: BLOGS_TAKE,
      },
    },
  });
}

// ============================================================
// ACTION
// ============================================================

export async function getTopCategoryPageBlogsAction(
  slug: string,
): Promise<GetTopCategoryPageBlogsResult> {
  try {
    const category = await getCachedCategoryPageBlogs(slug);

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    const editor: CategoryPageEditor = category.editor
      ? { ...category.editor, isFake: false }
      : { ...FAKE_EDITOR, isFake: true };

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        editor,
        subcategories: category.subcategories,
        blogs: category.blogs,
      },
    };
  } catch (err) {
    console.error("[getTopCategoryPageBlogsAction] Error:", err);
    return { success: false, error: "Failed to load category blogs." };
  }
}
