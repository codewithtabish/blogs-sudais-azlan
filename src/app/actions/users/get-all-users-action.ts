// src/app/actions/(users)/get-all-users-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

export type UserListItem = {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
};

type GetAllUsersResult =
  { success: true; users: UserListItem[] } | { success: false; error: string };

async function getCachedUsers() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.users);

  return prisma.user.findMany({
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllUsersAction(): Promise<GetAllUsersResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized." };
    }

    const users = await getCachedUsers();
    return { success: true, users };
  } catch (err) {
    console.error("[getAllUsers] Error:", err);
    return { success: false, error: "Failed to load users." };
  }
}
