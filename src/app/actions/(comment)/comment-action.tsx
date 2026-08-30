"use server";

import { Prisma } from "@/generated/prisma/browser";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

const commentSelect = {
  id: true,
  content: true,
  status: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      clerkId: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      email: true,
    },
  },
  replies: {
    where: {
      status: {
        in: ["APPROVED", "PENDING"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      content: true,
      status: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          clerkId: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.CommentSelect;

export type CommentWithUser = Prisma.CommentGetPayload<{
  select: typeof commentSelect;
}>;

type ActionResult<T = null> = { success: true; data: T } | { success: false; error: string };

/* =========================================================
   GET COMMENTS (with cache)
   ========================================================= */

async function getCachedCommentsByBlogId(blogId: string): Promise<CommentWithUser[]> {
  "use cache";

  cacheLife("max");
  cacheTag(CACHE_TAGS.comments(blogId));

  return prisma.comment.findMany({
    where: {
      blogId,
      parentId: null,
      status: {
        in: ["APPROVED", "PENDING"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: commentSelect,
  });
}

export async function getCommentsByBlogIdAction(
  blogId: string,
): Promise<ActionResult<CommentWithUser[]>> {
  try {
    if (!blogId?.trim()) {
      return { success: false, error: "Blog ID is required." };
    }

    const comments = await getCachedCommentsByBlogId(blogId);

    return { success: true, data: comments };
  } catch (err) {
    console.error("[getCommentsByBlogIdAction]", err);
    return { success: false, error: "Failed to load comments." };
  }
}

/* =========================================================
   CREATE COMMENT
   ========================================================= */

export async function createCommentAction(input: {
  blogId: string;
  content: string;
  parentId?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "You must be signed in to comment." };
    }

    const content = input.content?.trim();
    if (!content) {
      return { success: false, error: "Comment cannot be empty." };
    }
    if (content.length > 5000) {
      return {
        success: false,
        error: "Comment is too long (max 5000 characters).",
      };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Unable to identify user." };
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.user`;

    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        lastSeenAt: new Date(),
      },
      create: {
        clerkId: userId,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    });

    const blog = await prisma.blog.findFirst({
      where: {
        id: input.blogId,
        status: "PUBLISHED",
        publishedAt: {
          not: null,
          lte: new Date(),
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!blog) {
      return { success: false, error: "Blog not found or not published." };
    }

    if (input.parentId) {
      const parent = await prisma.comment.findFirst({
        where: {
          id: input.parentId,
          blogId: input.blogId,
        },
        select: { id: true },
      });

      if (!parent) {
        return { success: false, error: "Parent comment not found." };
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        blogId: input.blogId,
        userId: dbUser.id,
        parentId: input.parentId || null,
        status: "APPROVED",
      },
      select: { id: true },
    });

    // Revalidate only this blog's comments cache
    revalidateTag(CACHE_TAGS.comments(input.blogId), "max");

    return { success: true, data: { id: comment.id } };
  } catch (err: unknown) {
    console.error("[createCommentAction]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to post comment. Please try again.",
    };
  }
}

/* =========================================================
   DELETE COMMENT
   ========================================================= */

export async function deleteCommentAction(commentId: string): Promise<ActionResult<null>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "You must be signed in to delete a comment.",
      };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        blogId: true,
        user: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found." };
    }

    // Only the owner can delete
    if (comment.user.clerkId !== userId) {
      return {
        success: false,
        error: "You can only delete your own comments.",
      };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Revalidate only this blog's comments cache
    revalidateTag(CACHE_TAGS.comments(comment.blogId), "max");

    return { success: true, data: null };
  } catch (err: unknown) {
    console.error("[deleteCommentAction]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete comment.",
    };
  }
}
