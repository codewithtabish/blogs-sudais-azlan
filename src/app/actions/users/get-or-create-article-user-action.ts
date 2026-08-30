"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";
import { ADMIN_EMAILS } from "@/lib/admin-emails";

/**
 * Gets the currently authenticated Clerk user and makes sure
 * a corresponding User record exists in the INSIDER database.
 *
 * IMPORTANT:
 *
 * - Clerk is the authentication/source-of-truth system.
 * - The INSIDER User table is only the local application user record.
 * - ADMIN_EMAILS is the admin allow-list.
 * - If the user's primary email exists in ADMIN_EMAILS,
 *   the local user is created with role "ADMIN".
 * - Otherwise the local user is created with role "USER".
 * - Safe to call multiple times because clerkId is unique.
 *
 * INSIDER production URL:
 * https://insider.sudaisazlan.com
 */
export async function getOrCreateArticleUser() {
  // ==========================================================
  // 1. Get authenticated Clerk user ID
  // ==========================================================

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // ==========================================================
  // 2. Check whether this Clerk user already exists locally
  // ==========================================================

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  // ==========================================================
  // 3. User does not exist in INSIDER DB yet.
  //
  // Get the authenticated user directly from Clerk.
  // ==========================================================

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  // ==========================================================
  // 4. Get primary email from Clerk
  // ==========================================================

  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  // ==========================================================
  // 5. Determine local role from ADMIN_EMAILS
  //
  // ADMIN_EMAILS comes from .env:
  //
  // ADMIN_EMAILS=kashisultan099@gmail.com,tabish@codewithtabish.com,sudaisazlan09@gmail.com
  //
  // Comparison is case-insensitive.
  // ==========================================================

  const normalizedEmail = primaryEmail?.trim().toLowerCase() ?? "";

  const isAdmin = normalizedEmail.length > 0 && ADMIN_EMAILS.includes(normalizedEmail);

  const role = isAdmin ? "ADMIN" : "USER";

  // ==========================================================
  // 6. Create local INSIDER user
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

  revalidateTag(CACHE_TAGS.users, "max");

  // ==========================================================
  // 7. Logging
  // ==========================================================

  console.log("[INSIDER] Local user created.");
  console.log("[INSIDER] Clerk ID:", clerkUser.id);
  console.log("[INSIDER] Email:", normalizedEmail);
  console.log("[INSIDER] Role:", role);

  return newUser;
}
