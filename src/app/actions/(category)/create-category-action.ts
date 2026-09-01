"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { pingIndexNow } from "@/lib/index-now";
import { categorySchema } from "@/schemas/category-schema";
import prisma from "@/lib/prisma-client";

// ============================================================
// TYPES
// ============================================================

type CreateCategoryResult =
  | {
      success: true;
      categoryId: string;
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// CREATE CATEGORY
// ============================================================

export async function createCategoryAction(formData: unknown): Promise<CreateCategoryResult> {
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
    // 4. VALIDATE CATEGORY DATA
    // ========================================================

    const parsed = categorySchema.safeParse(formData);

    if (!parsed.success) {
      console.error("[createCategory] Validation error:", parsed.error.issues);

      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid category data.",
      };
    }

    const { name, slug, description, isActive, sortOrder } = parsed.data;

    // ========================================================
    // 5. NORMALIZE CATEGORY DATA
    // ========================================================

    const normalizedName = name.trim();

    const normalizedSlug = slug.trim().toLowerCase();

    const normalizedDescription = description?.trim() || null;

    // ========================================================
    // 6. CHECK DUPLICATE CATEGORY SLUG
    // ========================================================

    const existingCategory = await prisma.category.findUnique({
      where: {
        slug: normalizedSlug,
      },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "A category with this slug already exists.",
      };
    }

    // ========================================================
    // 7. CREATE CATEGORY
    // ========================================================

    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        slug: normalizedSlug,
        description: normalizedDescription,
        isActive,
        sortOrder,
      },
    });

    // ========================================================
    // 8. REVALIDATE CATEGORY CACHE
    // ========================================================

    revalidateTag(CACHE_TAGS.categories, "max");

    if (isActive) {
      revalidateTag(CACHE_TAGS.categoryPageBlogs(category.slug), "max");
    }

    revalidatePath("/dashboard/category");

    // ========================================================
    // 9. INDEXNOW
    // ========================================================

    if (isActive) {
      try {
        await pingIndexNow(`/${category.slug}`);

        console.log("[createCategory] IndexNow notification sent:", `/${category.slug}`);
      } catch (indexNowError) {
        // IndexNow failure must not make category creation fail.
        console.error("[createCategory] IndexNow notification failed:", indexNowError);
      }
    }

    // ========================================================
    // 10. SUCCESS
    // ========================================================

    return {
      success: true,
      categoryId: category.id,
    };
  } catch (error) {
    console.error("[createCategory] Unexpected error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong. Try again.",
    };
  }
}
