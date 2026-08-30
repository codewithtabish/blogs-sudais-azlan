// src/app/actions/(blog)/(dashboard)/get-blog-for-edit-action.ts
"use server";

import prisma from "@/lib/prisma-client";
import { auth } from "@clerk/nextjs/server";

// NOT cached with "use cache" on purpose — this feeds an edit form, so it
// should always read the freshest row, not a `cacheLife("max")` copy.
const blogForEditSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  tableOfContents: true,
  type: true,
  status: true,
  bannerImage: true,
  bannerImageAlt: true,
  featured: true,
  scheduledAt: true,
  categoryId: true,
  subcategoryId: true,
  seo: {
    select: {
      ogImage: true,
    },
  },
};

async function findBlogForEdit(id: string) {
  return prisma.blog.findUnique({
    where: { id },
    select: blogForEditSelect,
  });
}

export type BlogForEdit = NonNullable<Awaited<ReturnType<typeof findBlogForEdit>>>;

export type GetBlogForEditResult =
  { success: true; blog: BlogForEdit } | { success: false; error: string };

export async function getBlogForEditAction(id: string): Promise<GetBlogForEditResult> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Blog id is required." };
    }

    const blog = await findBlogForEdit(id);

    if (!blog) {
      return { success: false, error: "Blog not found." };
    }

    return { success: true, blog };
  } catch (err) {
    console.error("[getBlogForEditAction] Error:", err);
    return { success: false, error: "Failed to load blog." };
  }
}
