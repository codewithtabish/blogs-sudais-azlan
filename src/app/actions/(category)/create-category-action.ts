"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { pingIndexNow } from "@/lib/index-now";
import { categorySchema } from "@/schemas/category-schema";
import prisma from "@/lib/prisma-client";

import { getOrCreateArticleUser } from "../users/get-or-create-article-user-action";

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
//
// INSIDER
// https://insider.sudaisazlan.com
//
// Authentication:
// Clerk
//
// Local user:
// INSIDER Prisma User
//
// Admin authorization:
// ADMIN_EMAILS
//
// getOrCreateArticleUser() is responsible for:
// - Getting the authenticated Clerk user
// - Finding the local INSIDER user
// - Creating the local user if necessary
// - Determining ADMIN/USER from ADMIN_EMAILS
//
// This action only needs to check the resulting role.
// ============================================================

export async function createCategoryAction(formData: unknown): Promise<CreateCategoryResult> {
  try {
    // ========================================================
    // 1. GET / CREATE INSIDER USER
    // ========================================================
    //
    // This is the first-time synchronization point.
    //
    // If the Clerk user does not exist in the INSIDER database:
    //
    // Clerk user
    //      ↓
    // primary email
    //      ↓
    // ADMIN_EMAILS check
    //      ↓
    // ADMIN or USER
    //      ↓
    // INSIDER Prisma User
    //
    // If the user already exists, the existing record is
    // returned.

    const dbUser = await getOrCreateArticleUser();

    console.log("[createCategory] INSIDER user:", {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      role: dbUser.role,
      isActive: dbUser.isActive,
    });

    // ========================================================
    // 2. ADMIN AUTHORIZATION
    // ========================================================
    //
    // getOrCreateArticleUser() has already determined the role
    // using ADMIN_EMAILS.
    //
    // Example .env:
    //
    // ADMIN_EMAILS=kashisultan099@gmail.com,tabish@codewithtabish.com,sudaisazlan09@gmail.com
    //
    // If the authenticated user's primary email matches one
    // of those emails, their local role is ADMIN.
    //
    // Otherwise their role is USER.

    if (dbUser.role !== "ADMIN") {
      console.error("[createCategory] Unauthorized admin attempt:", {
        dbUserId: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        role: dbUser.role,
      });

      return {
        success: false,
        error: "You are not authorized to do this.",
      };
    }

    // ========================================================
    // 3. CHECK ACTIVE ACCOUNT
    // ========================================================

    if (!dbUser.isActive) {
      return {
        success: false,
        error: "Your account is currently inactive.",
      };
    }

    // ========================================================
    // 4. VALIDATE FORM DATA
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

    console.log("[createCategory] Category created:", {
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdBy: dbUser.id,
    });

    // ========================================================
    // 8. REVALIDATE INSIDER CACHE
    // ========================================================

    revalidateTag(CACHE_TAGS.categories, "max");

    if (isActive) {
      // This also clears a cached "not found" category-page lookup for
      // the newly created public slug.
      revalidateTag(CACHE_TAGS.categoryPageBlogs(category.slug), "max");
    }

    revalidatePath("/dashboard/category");

    // ========================================================
    // 9. INDEXNOW
    // ========================================================
    //
    // Your pingIndexNow() helper is responsible for the
    // INSIDER production URL:
    //
    // https://insider.sudaisazlan.com
    //
    // This action only sends the relative path.
    //
    // Example:
    //
    // /technology
    //
    // becomes:
    //
    // https://insider.sudaisazlan.com/technology
    //
    // assuming your index-now helper uses the INSIDER URL.

    if (isActive) {
      try {
        await pingIndexNow(`/${category.slug}`);

        console.log("[createCategory] IndexNow notification sent:", `/${category.slug}`);
      } catch (indexNowError) {
        // IndexNow is intentionally non-blocking.
        //
        // The category was already successfully created in
        // the database, so an IndexNow failure should not
        // report the entire operation as failed.

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
      error: "Something went wrong. Try again.",
    };
  }
}
