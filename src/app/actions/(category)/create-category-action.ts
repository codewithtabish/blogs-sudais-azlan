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
// An authenticated Clerk user may create a category.
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
    // 2. VALIDATE FORM DATA
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
    // 12. NORMALIZE CATEGORY DATA
    // ========================================================

    const normalizedName = name.trim();

    const normalizedSlug = slug.trim().toLowerCase();

    const normalizedDescription = description?.trim() || null;

    // ========================================================
    // 13. CHECK DUPLICATE CATEGORY SLUG
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
    // 14. CREATE CATEGORY
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

    console.log("[createCategory] Category created:", {
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdByClerkId: userId,
    });

    // ========================================================
    // 15. REVALIDATE CATEGORY CACHE
    // ========================================================

    revalidateTag(CACHE_TAGS.categories, "max");

    if (isActive) {
      revalidateTag(CACHE_TAGS.categoryPageBlogs(category.slug), "max");
    }

    revalidatePath("/dashboard/category");

    // ========================================================
    // 16. INDEXNOW
    // ========================================================
    //
    // pingIndexNow() handles:
    //
    // https://insider.sudaisazlan.com
    //
    // We only provide the relative category path.
    //

    if (isActive) {
      try {
        await pingIndexNow(`/${category.slug}`);

        console.log("[createCategory] IndexNow notification sent:", `/${category.slug}`);
      } catch (indexNowError) {
        // IndexNow failure must not make the category
        // creation operation fail.

        console.error("[createCategory] IndexNow notification failed:", indexNowError);
      }
    }

    // ========================================================
    // 17. SUCCESS
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
