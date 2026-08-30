// src/app/actions/(category)/delete-subcategory-action.ts

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { pingIndexNow } from "@/lib/index-now";
import prisma from "@/lib/prisma-client";

// ============================================================
// TYPES
// ============================================================

type DeleteSubcategoryResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// DELETE SUBCATEGORY
// ============================================================

export async function deleteSubcategoryAction(
  subcategoryId: string,
): Promise<DeleteSubcategoryResult> {
  try {
    // ========================================================
    // 1. AUTHENTICATION
    // ========================================================

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "You must be signed in.",
      };
    }

    // ========================================================
    // 2. ADMIN AUTHORIZATION
    // ========================================================

    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return {
        success: false,
        error: "You are not authorized to do this.",
      };
    }

    // ========================================================
    // 3. VALIDATE SUBCATEGORY ID
    // ========================================================

    const normalizedSubcategoryId = subcategoryId?.trim();

    if (!normalizedSubcategoryId) {
      return {
        success: false,
        error: "Missing subcategory id.",
      };
    }

    try {
      // ======================================================
      // 4. FIND SUBCATEGORY
      //
      // Save the public URL information BEFORE deleting it.
      // ======================================================

      const subcategory = await prisma.subcategory.findUnique({
        where: {
          id: normalizedSubcategoryId,
        },
        select: {
          id: true,
          slug: true,
          category: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      });

      if (!subcategory) {
        return {
          success: false,
          error: "Subcategory not found.",
        };
      }

      // ======================================================
      // PUBLIC PATHS
      //
      // Subcategory:
      // /technology/artificial-intelligence
      //
      // Category:
      // /technology
      //
      // pingIndexNow() adds:
      // https://insider.sudaisazlan.com
      // ======================================================

      const categoryPath = `/${subcategory.category.slug}`;

      const subcategoryPath = `/${subcategory.category.slug}/${subcategory.slug}`;

      // ======================================================
      // 5. DELETE SUBCATEGORY
      // ======================================================

      await prisma.subcategory.delete({
        where: {
          id: subcategory.id,
        },
      });

      // ======================================================
      // 6. REVALIDATE DASHBOARD CACHE
      // ======================================================

      revalidateTag(CACHE_TAGS.categories, "max");

      revalidatePath("/dashboard/category");
      revalidatePath("/dashboard");

      // ======================================================
      // 7. REVALIDATE PUBLIC SUBCATEGORY PAGE
      //
      // revalidatePath() receives a relative path only.
      // ======================================================

      revalidatePath(subcategoryPath);

      // ======================================================
      // 8. REVALIDATE PARENT CATEGORY PAGE
      //
      // Removing a subcategory can affect the category page.
      // ======================================================

      revalidatePath(categoryPath);

      // ======================================================
      // 9. REVALIDATE SUBCATEGORY CACHE
      //
      // This assumes your cache-keys.ts contains
      // subcategoryPageBlogs(slug).
      // ======================================================

      revalidateTag(CACHE_TAGS.subcategoryPageBlogs(subcategory.slug), "max");

      // ======================================================
      // 10. REVALIDATE CATEGORY CACHE
      //
      // The parent category can also have changed content.
      // ======================================================

      revalidateTag(CACHE_TAGS.categoryPageBlogs(subcategory.category.slug), "max");

      // ======================================================
      // 11. NOTIFY INDEXNOW
      //
      // IMPORTANT:
      // Pass ONLY relative paths.
      //
      // subcategoryPath:
      // /technology/artificial-intelligence
      //
      // becomes:
      // https://insider.sudaisazlan.com/technology/artificial-intelligence
      //
      // IndexNow does not receive the full domain here because
      // src/lib/index-now.ts already adds SITE_URL.
      // ======================================================

      await pingIndexNow(subcategoryPath);

      // ======================================================
      // 12. SUCCESS
      // ======================================================

      return {
        success: true,
      };
    } catch (error) {
      console.error("[deleteSubcategoryAction] Database error:", error);

      return {
        success: false,
        error: "Something went wrong. Try again.",
      };
    }
  } catch (error) {
    console.error("[deleteSubcategoryAction] Error:", error);

    return {
      success: false,
      error: "Something went wrong. Try again.",
    };
  }
}
