// src/app/actions/(category)/delete-category-action.ts

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { pingIndexNow } from "@/lib/index-now";
import prisma from "@/lib/prisma-client";

// ============================================================
// TYPES
// ============================================================

type DeleteCategoryResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// DELETE CATEGORY
// ============================================================

export async function deleteCategoryAction(categoryId: string): Promise<DeleteCategoryResult> {
  try {
    // ========================================================
    // 1. AUTHENTICATION
    // ========================================================

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    // ========================================================
    // 2. VALIDATE CATEGORY ID
    // ========================================================

    const normalizedCategoryId = categoryId?.trim();

    if (!normalizedCategoryId) {
      return {
        success: false,
        error: "Missing category id.",
      };
    }

    // ========================================================
    // 4. FIND CATEGORY
    //
    // Save everything needed BEFORE deleting it.
    // ========================================================

    const category = await prisma.category.findUnique({
      where: {
        id: normalizedCategoryId,
      },
      select: {
        id: true,
        slug: true,
        subcategories: {
          select: { slug: true },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found.",
      };
    }

    // ========================================================
    // PUBLIC CATEGORY PATH
    //
    // IndexNow receives a relative path.
    //
    // /technology
    //
    // pingIndexNow() converts it to:
    //
    // https://insider.sudaisazlan.com/technology
    // ========================================================

    const categoryPath = `/${category.slug}`;

    // ========================================================
    // 5. DELETE CATEGORY
    //
    // First delete child subcategories, then the category.
    //
    // This prevents foreign-key constraint problems when
    // subcategories reference the category.
    // ========================================================

    await prisma.$transaction([
      prisma.subcategory.deleteMany({
        where: {
          categoryId: category.id,
        },
      }),

      prisma.category.delete({
        where: {
          id: category.id,
        },
      }),
    ]);

    // ========================================================
    // 6. REVALIDATE DASHBOARD CACHE
    // ========================================================

    revalidateTag(CACHE_TAGS.categories, "max");
    revalidateTag(CACHE_TAGS.editors, "max");

    revalidatePath("/dashboard/category");
    revalidatePath("/dashboard/editors");

    // ========================================================
    // 7. REVALIDATE PUBLIC CATEGORY PAGE
    //
    // Important:
    // revalidatePath() receives a RELATIVE path.
    //
    // Correct:
    // /technology
    //
    // Not:
    // https://insider.sudaisazlan.com/technology
    // ========================================================

    revalidatePath(categoryPath);

    // ========================================================
    // 8. REVALIDATE CATEGORY BLOG CACHE
    //
    // This assumes CACHE_TAGS.categoryPageBlogs() exists
    // in your current cache-keys.ts.
    // ========================================================

    revalidateTag(CACHE_TAGS.categoryPageBlogs(category.slug), "max");

    for (const subcategory of category.subcategories) {
      revalidateTag(CACHE_TAGS.subcategoryPageBlogs(subcategory.slug), "max");
    }

    // ========================================================
    // 9. NOTIFY INDEXNOW
    //
    // Pass ONLY the relative path.
    //
    // pingIndexNow() already knows:
    // https://insider.sudaisazlan.com
    // ========================================================

    await pingIndexNow(categoryPath);

    // ========================================================
    // 10. SUCCESS
    // ========================================================

    return {
      success: true,
    };
  } catch (error) {
    console.error("[deleteCategoryAction] Error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong. Try again.",
    };
  }
}
