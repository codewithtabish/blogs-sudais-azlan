"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { pingIndexNow } from "@/lib/index-now";
import prisma from "@/lib/prisma-client";

// ============================================================
// TYPES
// ============================================================

export type DeleteBlogResult =
  | {
      success: true;
      data: {
        id: string;
        slug: string;
      };
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// DELETE BLOG ACTION
// ============================================================

export async function deleteBlogAction(blogId: string): Promise<DeleteBlogResult> {
  try {
    // ========================================================
    // 1. AUTHENTICATION
    // ========================================================

    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return {
        success: false,
        error: "Unauthorized. Please sign in.",
      };
    }

    // ========================================================
    // 2. VALIDATION
    // ========================================================

    if (!blogId?.trim()) {
      return {
        success: false,
        error: "Blog id is required.",
      };
    }

    // ========================================================
    // 3. FIND BLOG
    // ========================================================

    const blog = await prisma.blog.findUnique({
      where: {
        id: blogId,
      },
      select: {
        id: true,
        slug: true,
        status: true,

        category: {
          select: {
            slug: true,
          },
        },

        subcategory: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!blog) {
      return {
        success: false,
        error: "Blog not found.",
      };
    }

    // ========================================================
    // 4. SAVE URL IDENTIFIERS BEFORE DELETE
    // ========================================================

    const blogSlug = blog.slug;
    const categorySlug = blog.category.slug;
    const subcategorySlug = blog.subcategory.slug;

    // IndexNow helper expects a relative path only.
    //
    // index-now.ts will internally convert this:
    //
    // /category/subcategory/blog
    //
    // into:
    //
    // https://insider.sudaisazlan.com/category/subcategory/blog

    const blogPath = `/${categorySlug}/${subcategorySlug}/${blogSlug}`;

    // ========================================================
    // 5. DELETE BLOG
    // ========================================================

    await prisma.blog.delete({
      where: {
        id: blog.id,
      },
    });

    // ========================================================
    // 6. PATH REVALIDATION
    // ========================================================

    // Dashboard blog list
    revalidatePath("/dashboard/blogs");

    // ========================================================
    // 7. CACHE TAG REVALIDATION
    // ========================================================

    if (blog.status === "PUBLISHED") {
      revalidatePath("/");
      revalidatePath(blogPath);
      revalidatePath(`/${categorySlug}`);
      revalidatePath(`/${categorySlug}/${subcategorySlug}`);

      revalidateTag(CACHE_TAGS.home, "max");
      revalidateTag(CACHE_TAGS.categoryPageBlogs(categorySlug), "max");
      revalidateTag(CACHE_TAGS.subcategoryPageBlogs(subcategorySlug), "max");
      revalidateTag(CACHE_TAGS.blog(blogSlug), "max");
    }

    // COMMENTS
    revalidateTag(CACHE_TAGS.comments(blog.id), "max");

    // ========================================================
    // 8. NOTIFY INDEXNOW
    // ========================================================

    // IMPORTANT:
    // pingIndexNow() already knows the SITE_URL.
    // Pass only the relative path.
    await pingIndexNow(blogPath);

    // ========================================================
    // 9. RESPONSE
    // ========================================================

    return {
      success: true,
      data: {
        id: blog.id,
        slug: blog.slug,
      },
    };
  } catch (error) {
    console.error("❌ Delete blog error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete blog",
    };
  }
}
