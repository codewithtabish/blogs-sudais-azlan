"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { ADMIN_EMAILS } from "@/lib/admin-emails";
import prisma from "@/lib/prisma-client";

/**
 * Gets the currently authenticated Clerk user and synchronizes
 * the corresponding User record in the INSIDER database.
 *
 * IMPORTANT:
 *
 * - Clerk is the authentication/source-of-truth system.
 * - The INSIDER User table is the local application user record.
 * - ADMIN_EMAILS is the admin allow-list.
 * - The role is ALWAYS recalculated from the current Clerk email.
 * - Existing users are UPDATED so changes to ADMIN_EMAILS take effect.
 * - New users are CREATED with the correct role.
 *
 * INSIDER production URL:
 * https://insider.sudaisazlan.com
 */
export async function getOrCreateArticleUser() {
  // ==========================================================
  // 1. GET AUTHENTICATED CLERK USER ID
  // ==========================================================

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // ==========================================================
  // 2. GET CURRENT CLERK USER
  //
  // We intentionally do this even when the local user already
  // exists because ADMIN_EMAILS and Clerk profile information
  // must be synchronized on every call.
  // ==========================================================

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  // ==========================================================
  // 3. GET PRIMARY EMAIL
  // ==========================================================

  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  // ==========================================================
  // 4. NORMALIZE EMAIL
  // ==========================================================

  const normalizedEmail = primaryEmail?.trim().toLowerCase() ?? "";

  // ==========================================================
  // 5. DETERMINE ROLE FROM ADMIN_EMAILS
  //
  // ADMIN_EMAILS is already normalized in:
  //
  // src/lib/admin-emails.ts
  //
  // Example:
  //
  // ADMIN_EMAILS=
  // kashisultan099@gmail.com,
  // tabish@codewithtabish.com,
  // sudaisazlan09@gmail.com
  //
  // The comparison is case-insensitive because the current
  // Clerk email is normalized before comparison.
  // ==========================================================

  const isAdmin = normalizedEmail.length > 0 && ADMIN_EMAILS.includes(normalizedEmail);

  const role = isAdmin ? "ADMIN" : "USER";

  // ==========================================================
  // 6. CHECK EXISTING LOCAL USER
  // ==========================================================

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  // ==========================================================
  // 7. UPDATE EXISTING USER
  //
  // IMPORTANT:
  //
  // We update the role every time.
  //
  // This means:
  //
  // ADMIN_EMAILS adds email
  //        ↓
  // existing USER
  //        ↓
  // becomes ADMIN
  //
  // ADMIN_EMAILS removes email
  //        ↓
  // existing ADMIN
  //        ↓
  // becomes USER
  //
  // No manual database update is required.
  // ==========================================================

  if (existingUser) {
    const updatedUser = await prisma.user.update({
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

    // Only revalidate users cache when synchronization actually
    // happens. This keeps the cache behavior predictable.
    revalidateTag(CACHE_TAGS.users, "max");

    console.log("[INSIDER] Local user synchronized.");
    console.log("[INSIDER] Clerk ID:", clerkUser.id);
    console.log("[INSIDER] Email:", normalizedEmail);
    console.log("[INSIDER] Previous role:", existingUser.role);
    console.log("[INSIDER] Current role:", updatedUser.role);

    return updatedUser;
  }

  // ==========================================================
  // 8. CREATE NEW LOCAL USER
  // ==========================================================

  const newUser = await prisma.user.create({
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

  // ==========================================================
  // 9. REVALIDATE USERS CACHE
  // ==========================================================

  revalidateTag(CACHE_TAGS.users, "max");

  // ==========================================================
  // 10. LOGGING
  // ==========================================================

  console.log("[INSIDER] Local user created.");
  console.log("[INSIDER] Clerk ID:", clerkUser.id);
  console.log("[INSIDER] Email:", normalizedEmail);
  console.log("[INSIDER] Role:", role);

  return newUser;
}
