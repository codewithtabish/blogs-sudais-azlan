"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma-client";

/**
 * Gets the currently authenticated Clerk user and makes sure
 * a corresponding User record exists in the Articles database.
 *
 * IMPORTANT:
 * - Clerk remains the authentication/source-of-truth system.
 * - This User table is only the Articles app's local user record.
 * - Safe to call multiple times because clerkId is unique.
 * - Existing users are returned without creating duplicates.
 */
export async function getOrCreateArticleUser() {
  // ----------------------------------------------------------
  // 1. Get authenticated Clerk user ID
  // ----------------------------------------------------------

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // ----------------------------------------------------------
  // 2. Check whether this Clerk user already exists
  // ----------------------------------------------------------

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  // ----------------------------------------------------------
  // 3. User doesn't exist in Articles DB yet.
  //    Get their information directly from Clerk.
  // ----------------------------------------------------------

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  // ----------------------------------------------------------
  // 4. Get primary email
  // ----------------------------------------------------------

  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  // ----------------------------------------------------------
  // 5. Create local Articles User
  // ----------------------------------------------------------

  const newUser = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,

      email: primaryEmail,

      firstName: clerkUser.firstName,

      lastName: clerkUser.lastName,

      imageUrl: clerkUser.imageUrl,

      role: "USER",

      isActive: true,

      isVerified: false,
    },
  });

  return newUser;
}
