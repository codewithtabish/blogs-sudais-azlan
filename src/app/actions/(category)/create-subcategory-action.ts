// src/app/actions/(category)/create-subcategory-action.ts

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";
import { pingIndexNow } from "@/lib/index-now";
import { subcategorySchema } from "@/schemas/subcategory-schema";

// ============================================================
// TYPES
// ============================================================

type CreateSubcategoryResult =
  | {
      success: true;
      subcategoryId: string;
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// CREATE SUBCATEGORY
// ============================================================

export async function createSubcategoryAction(formData: unknown): Promise<CreateSubcategoryResult> {
  // ==========================================================
  // AUTH GUARD
  // ==========================================================

  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "Unauthorized.",
    };
  }

  // ==========================================================
  // VALIDATE INPUT
  // ==========================================================

  const parsed = subcategorySchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }

  const { categoryId, name, slug, description, isActive, sortOrder } = parsed.data;

  try {
    // ========================================================
    // CHECK PARENT CATEGORY
    // ========================================================

    const parentCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!parentCategory) {
      return {
        success: false,
        error: "Selected category no longer exists.",
      };
    }

    // ========================================================
    // CHECK DUPLICATE SLUG
    // ========================================================

    const existing = await prisma.subcategory.findUnique({
      where: {
        slug,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A subcategory with this slug already exists.",
      };
    }

    // ========================================================
    // CREATE SUBCATEGORY
    // ========================================================

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId,
        name,
        slug,
        description: description || null,
        isActive,
        sortOrder,
      },
    });

    // The category tree always includes every subcategory. Category and
    // subcategory page readers include active subcategory navigation too.
    revalidateTag(CACHE_TAGS.categories, "max");

    if (isActive && parentCategory.isActive) {
      revalidateTag(CACHE_TAGS.categoryPageBlogs(parentCategory.slug), "max");

      const siblingSubcategories = await prisma.subcategory.findMany({
        where: { categoryId, isActive: true },
        select: { slug: true },
      });

      for (const sibling of siblingSubcategories) {
        revalidateTag(CACHE_TAGS.subcategoryPageBlogs(sibling.slug), "max");
      }
    }

    // ========================================================
    // REVALIDATE DASHBOARD
    // ========================================================

    revalidatePath("/dashboard/category");

    // ========================================================
    // INDEXNOW
    // ========================================================
    //
    // pingIndexNow() handles NEXT_PUBLIC_BASE_URL internally.
    // We only pass the relative URL path here.
    //
    // Example:
    // /technology/artificial-intelligence
    //
    // Local:
    // http://localhost:3000/technology/artificial-intelligence
    //
    // Production:
    // https://insider.sudaisazlan.com/technology/artificial-intelligence
    // ========================================================

    if (isActive && parentCategory.isActive) {
      const subcategoryPath = `/${parentCategory.slug}/${subcategory.slug}`;

      await pingIndexNow(subcategoryPath);
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return {
      success: true,
      subcategoryId: subcategory.id,
    };
  } catch (error) {
    console.error("[createSubcategoryAction] Error:", error);

    return {
      success: false,
      error: "Something went wrong. Try again.",
    };
  }
}
