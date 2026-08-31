"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

/** Synchronizes a Clerk profile when a local relational author is required. */
export async function getOrCreateArticleUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Clerk user not found");

  const email =
    clerkUser.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Clerk user does not have an email address");

  const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  const profileChanged =
    !existingUser ||
    existingUser.email !== email ||
    existingUser.firstName !== clerkUser.firstName ||
    existingUser.lastName !== clerkUser.lastName ||
    existingUser.imageUrl !== clerkUser.imageUrl;

  const user = existingUser
    ? await prisma.user.update({
        where: { clerkId: userId },
        data: {
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      })
    : await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      });

  if (profileChanged) revalidateTag(CACHE_TAGS.users, "max");

  return user;
}
