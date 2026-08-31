"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { ADMIN_EMAILS } from "@/lib/admin-emails";
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
//
// INSIDER
// https://insider.sudaisazlan.com
//
// Authentication:
// Clerk
//
// User information:
// Clerk currentUser()
//
// Local user:
// INSIDER Prisma User
//
// Authorization:
// ADMIN ONLY
//
// Flow:
//
// Clerk auth()
//      ↓
// Clerk currentUser()
//      ↓
// Primary email
//      ↓
// ADMIN_EMAILS
//      ↓
// ADMIN / USER
//      ↓
// Find local Prisma user
//      ↓
// Create OR update local user
//      ↓
// ADMIN authorization
//      ↓
// Create category
//
// ============================================================

export async function createCategoryAction(formData: unknown): Promise<CreateCategoryResult> {
  try {
    // ========================================================
    // 1. GET AUTHENTICATED CLERK USER ID
    // ========================================================

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    // ========================================================
    // 2. GET CURRENT CLERK USER
    // ========================================================

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return {
        success: false,
        error: "Clerk user not found.",
      };
    }

    // ========================================================
    // 3. GET PRIMARY EMAIL
    // ========================================================

    const primaryEmail =
      clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null;

    if (!primaryEmail) {
      return {
        success: false,
        error: "Your Clerk account does not have an email address.",
      };
    }

    // ========================================================
    // 4. NORMALIZE EMAIL
    // ========================================================

    const normalizedEmail = primaryEmail.trim().toLowerCase();

    // ========================================================
    // 5. DETERMINE ROLE FROM ADMIN_EMAILS
    // ========================================================
    //
    // ADMIN_EMAILS is the admin allow-list.
    //
    // Example:
    //
    // ADMIN_EMAILS=
    // kashisultan099@gmail.com,
    // tabish@codewithtabish.com,
    // sudaisazlan09@gmail.com
    //
    // The comparison is case-insensitive.
    //

    const isAdmin = normalizedEmail.length > 0 && ADMIN_EMAILS.includes(normalizedEmail);

    const role = isAdmin ? "ADMIN" : "USER";

    // ========================================================
    // 6. FIND LOCAL INSIDER USER
    // ========================================================

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    // ========================================================
    // 7. CREATE OR UPDATE LOCAL USER
    // ========================================================
    //
    // Clerk remains the source of truth for:
    //
    // - email
    // - firstName
    // - lastName
    // - imageUrl
    //
    // ADMIN_EMAILS determines:
    //
    // - ADMIN
    // - USER
    //
    // Existing users are synchronized.
    //

    let dbUser;

    if (existingUser) {
      dbUser = await prisma.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          role,
        },
      });

      console.log("[createCategory] INSIDER user updated:", {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        isActive: dbUser.isActive,
      });
    } else {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          role,
          isActive: true,
          isVerified: false,
        },
      });

      console.log("[createCategory] INSIDER user created:", {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        isActive: dbUser.isActive,
      });
    }

    // ========================================================
    // 8. REVALIDATE USER CACHE
    // ========================================================

    revalidateTag(CACHE_TAGS.users, "max");

    // ========================================================
    // 9. ADMIN AUTHORIZATION
    // ========================================================
    //
    // This category action is ADMIN ONLY.
    //
    // The required role is explicitly ADMIN.
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
        error: "You are not authorized to create categories.",
      };
    }

    // ========================================================
    // 10. CHECK ACTIVE ACCOUNT
    // ========================================================

    if (!dbUser.isActive) {
      return {
        success: false,
        error: "Your account is currently inactive.",
      };
    }

    // ========================================================
    // 11. VALIDATE FORM DATA
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
      createdBy: dbUser.id,
      createdByEmail: dbUser.email,
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
