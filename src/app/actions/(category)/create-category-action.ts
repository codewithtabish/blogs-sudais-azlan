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
//
// - Getting the authenticated Clerk user
// - Finding the local INSIDER user
// - Creating the local user if necessary
// - Updating the local user if it already exists
// - Synchronizing the user's email/profile information
// - Determining ADMIN/USER from ADMIN_EMAILS
//
// This action only needs to check the resulting role.
// ============================================================

export async function createCategoryAction(formData: unknown): Promise<CreateCategoryResult> {
  try {
    // ========================================================
    // 1. GET / CREATE / UPDATE INSIDER USER
    // ========================================================
    //
    // This function always synchronizes the Clerk user with
    // the local INSIDER user.
    //
    // If the user does not exist:
    //
    // Clerk
    //   ↓
    // primary email
    //   ↓
    // ADMIN_EMAILS
    //   ↓
    // ADMIN / USER
    //   ↓
    // CREATE INSIDER USER
    //
    // If the user already exists:
    //
    // Clerk
    //   ↓
    // primary email
    //   ↓
    // ADMIN_EMAILS
    //   ↓
    // ADMIN / USER
    //   ↓
    // UPDATE INSIDER USER
    //
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
    // getOrCreateArticleUser() has already synchronized the
    // user's role using ADMIN_EMAILS.
    //
    // Therefore this check always uses the CURRENT role.
    //
    // Example:
    //
    // ADMIN_EMAILS=
    // kashisultan099@gmail.com,
    // tabish@codewithtabish.com,
    // sudaisazlan09@gmail.com
    //
    // If the current Clerk email matches one of these emails:
    //
    // role = ADMIN
    //
    // Otherwise:
    //
    // role = USER
    //

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
      // Clears any cached "not found" category-page lookup
      // for the newly created public category.
      revalidateTag(CACHE_TAGS.categoryPageBlogs(category.slug), "max");
    }

    revalidatePath("/dashboard/category");

    // ========================================================
    // 9. INDEXNOW
    // ========================================================
    //
    // pingIndexNow() is responsible for using:
    //
    // https://insider.sudaisazlan.com
    //
    // This action only passes the relative path.
    //
    // Example:
    //
    // /technology
    //
    // becomes:
    //
    // https://insider.sudaisazlan.com/technology
    //

    if (isActive) {
      try {
        await pingIndexNow(`/${category.slug}`);

        console.log("[createCategory] IndexNow notification sent:", `/${category.slug}`);
      } catch (indexNowError) {
        // IndexNow must never cause a successfully created
        // category to be reported as a failed operation.

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
