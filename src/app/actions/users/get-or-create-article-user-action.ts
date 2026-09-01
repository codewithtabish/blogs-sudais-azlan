"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";

import prisma from "@/lib/prisma-client";
import { isAdminEmail } from "@/lib/admin-emails";

/**
 * Synchronizes the authenticated Clerk profile when a local
 * relational author is required.
 *
 * The user's Prisma role is determined by the ADMIN_EMAILS
 * allow-list.
 *
 * ADMIN_EMAILS email -> ADMIN
 * Any other email     -> USER
 */
export async function getOrCreateArticleUser() {
  // ============================================================
  // 1. AUTHENTICATION
  // ============================================================

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // ============================================================
  // 2. GET CLERK USER
  // ============================================================

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  // ============================================================
  // 3. GET EMAIL
  // ============================================================

  const email =
    clerkUser.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Clerk user does not have an email address");
  }

  // ============================================================
  // 4. NORMALIZE EMAIL
  // ============================================================

  const normalizedEmail = email.trim().toLowerCase();

  // ============================================================
  // 5. DETERMINE ROLE FROM ADMIN EMAIL ALLOW-LIST
  // ============================================================

  const role = isAdminEmail(normalizedEmail) ? "ADMIN" : "USER";

  // ============================================================
  // 6. FIND EXISTING LOCAL USER
  // ============================================================

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  // ============================================================
  // 7. CHECK WHETHER PROFILE OR ROLE CHANGED
  // ============================================================

  const profileChanged =
    !existingUser ||
    existingUser.email !== normalizedEmail ||
    existingUser.firstName !== clerkUser.firstName ||
    existingUser.lastName !== clerkUser.lastName ||
    existingUser.imageUrl !== clerkUser.imageUrl ||
    existingUser.role !== role;

  // ============================================================
  // 8. UPDATE EXISTING USER
  // ============================================================

  const user = existingUser
    ? await prisma.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          email: normalizedEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,

          // Role is controlled by ADMIN_EMAILS.
          role,
        },
      })
    : // ========================================================
      // 9. CREATE NEW USER
      // ========================================================
      await prisma.user.create({
        data: {
          clerkId: userId,
          email: normalizedEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,

          // ADMIN if email is in ADMIN_EMAILS,
          // otherwise USER.
          role,
        },
      });

  // ============================================================
  // 10. REVALIDATE USER CACHE
  // ============================================================

  if (profileChanged) {
    revalidateTag(CACHE_TAGS.users, "max");
  }

  // ============================================================
  // 11. RETURN USER
  // ============================================================

  return user;
}
