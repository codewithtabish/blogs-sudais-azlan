// src/app/actions/(category)/get-all-categories-action.ts
"use server";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

export type SubcategoryListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

export type CategoryEditorItem = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
};

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  subcategories: SubcategoryListItem[];
  /** The editor currently assigned to this category (null if unassigned) */
  editor: CategoryEditorItem | null;
};

type GetAllCategoriesResult =
  { success: true; categories: CategoryListItem[] } | { success: false; error: string };

async function getCachedCategories() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.categories);

  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      sortOrder: true,
      subcategories: {
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
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getAllCategoriesAction(): Promise<GetAllCategoriesResult> {
  try {
    const categories = await getCachedCategories();
    return { success: true, categories };
  } catch (err) {
    console.error("[getAllCategories] Error:", err);
    return { success: false, error: "Failed to load categories." };
  }
}
