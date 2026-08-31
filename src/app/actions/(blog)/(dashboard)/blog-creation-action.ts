"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { OpenAI } from "openai";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { pingIndexNow } from "@/lib/index-now";
import prisma from "@/lib/prisma-client";
import { CreateBlogInput, CreateBlogResult } from "@/schemas/blog-schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ============================================================
// HELPERS
// ============================================================

function extractTextFromContent(content: any): string {
  if (!content?.blocks) {
    return "";
  }

  return content.blocks
    .map((block: any) => {
      switch (block.type) {
        case "paragraph":
        case "aitext":
          return block.data?.text || "";

        case "header":
          return `${"#".repeat(block.data?.level || 2)} ${block.data?.text || ""}`;

        case "list":
        case "checklist":
          return (block.data?.items || [])
            .map((item: any) => (typeof item === "string" ? item : item.content || item.text || ""))
            .join("\n");

        case "quote":
          return `> ${block.data?.text || ""}`;

        case "raw":
          return (block.data?.html || "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

function estimateReadingTime(content: any): number {
  const text = extractTextFromContent(content);

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

// ============================================================
// BLOG URL
// ============================================================

function buildBlogUrl(categorySlug: string, subcategorySlug: string, blogSlug: string): string {
  const baseUrl = BASE_URL.replace(/\/+$/, "");

  return `${baseUrl}/${categorySlug}/${subcategorySlug}/${blogSlug}`;
}

// ============================================================
// LOCAL USER SYNCHRONIZATION
// ============================================================
//
// IMPORTANT:
//
// Clerk is the authentication system.
//
// Prisma User is only the local application user record.
//
// There is NO:
// - ADMIN_EMAILS
// - ADMIN role check
// - authorization check
// - active-account authorization
//
// Flow:
//
// Clerk user
//     ↓
// Get Clerk profile
//     ↓
// Find Prisma user by clerkId
//     ↓
// If not found, find by email
//     ↓
// Existing user → update/link Clerk ID
// New user      → create
//
// This prevents:
// User_email_key unique constraint errors.
// ============================================================

async function getOrCreateLocalUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized.");
  }

  const clerkId = clerkUser.id;

  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  const normalizedEmail = primaryEmail?.trim().toLowerCase() || null;

  // ==========================================================
  // 1. FIND BY CLERK ID
  // ==========================================================

  const existingByClerkId = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });

  if (existingByClerkId) {
    return prisma.user.update({
      where: {
        id: existingByClerkId.id,
      },
      data: {
        email: primaryEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  // ==========================================================
  // 2. FIND BY EMAIL
  // ==========================================================
  //
  // This is the important fix for:
  //
  // User_email_key
  //
  // If the Prisma user already exists but was created
  // without this Clerk ID, link the existing user instead
  // of trying to create another user with the same email.
  //
  // ==========================================================

  if (normalizedEmail) {
    const existingByEmail = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingByEmail) {
      return prisma.user.update({
        where: {
          id: existingByEmail.id,
        },
        data: {
          clerkId,
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      });
    }
  }

  // ==========================================================
  // 3. CREATE NEW LOCAL USER
  // ==========================================================

  return prisma.user.create({
    data: {
      clerkId,
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,

      // No authorization decision is made here.
      // This is only the default local application role
      // required by the Prisma schema, if applicable.
      role: "USER",

      isActive: true,
      isVerified: false,
    },
  });
}

// ============================================================
// AI SEO GENERATION
// ============================================================

async function generateSEOWithAI(title: string, contentText: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",

          content: `You are an expert SEO specialist. Generate professional SEO metadata and a short description.

STRICT RULES:

- DO NOT change the title
- shortDescription: 1-2 sentences, max 160 characters
- metaTitle under 60 characters
- metaDescription under 160 characters
- Return ONLY valid JSON

{
  "shortDescription": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "ogDescription": "...",
  "twitterDescription": "...",
  "keywords": ["max", "10"],
  "summary": "2-3 sentence summary"
}`,
        },

        {
          role: "user",

          content: `Blog Title: ${title}

Blog Content:

${contentText.slice(0, 3500)}`,
        },
      ],

      temperature: 0.7,
      max_tokens: 1200,
    });

    const aiResponse = response.choices[0]?.message?.content || "";

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        shortDescription:
          parsed.shortDescription ||
          `Learn about ${title} — a comprehensive guide with expert insights.`,

        metaTitle: parsed.metaTitle || title.slice(0, 60),

        metaDescription:
          parsed.metaDescription ||
          `Read about ${title}. Discover detailed insights and information.`,

        ogDescription: parsed.ogDescription || `Learn more about ${title}`,

        twitterDescription:
          parsed.twitterDescription || parsed.ogDescription || `Learn about ${title}`,

        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : [],

        summary: parsed.summary || "",
      };
    }

    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("OpenAI generation error:", error);

    return {
      shortDescription: `Learn about ${title} — a comprehensive guide with expert insights and practical tips.`,

      metaTitle: title.slice(0, 60),

      metaDescription: `Read about ${title}. Discover detailed insights, tips, and comprehensive information.`,

      ogDescription: `Explore ${title} - a comprehensive guide with expert insights.`,

      twitterDescription: `Learn about ${title} - expert insights and comprehensive guide.`,

      keywords: [title.toLowerCase().replace(/\s+/g, "-")],

      summary: `A comprehensive guide about ${title}.`,
    };
  }
}

// ============================================================
// CREATE BLOG
// ============================================================
//
// Any authenticated Clerk user can create a blog.
//
// There is NO ADMIN authorization check here.
// ============================================================

export async function createBlogAction(data: CreateBlogInput): Promise<CreateBlogResult> {
  try {
    // ========================================================
    // 1. CLERK AUTHENTICATION
    // ========================================================

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to create a blog.",
      };
    }

    // ========================================================
    // 2. GET / CREATE / SYNC LOCAL USER
    // ========================================================

    const user = await getOrCreateLocalUser();

    // ========================================================
    // 3. VALIDATION
    // ========================================================

    const title = data.title?.trim();
    const slug = data.slug?.trim();

    if (!title) {
      return {
        success: false,
        error: "Title is required.",
      };
    }

    if (!slug) {
      return {
        success: false,
        error: "Slug is required.",
      };
    }

    if (!data.bannerImage) {
      return {
        success: false,
        error: "Banner image is required.",
      };
    }

    if (!data.ogImage) {
      return {
        success: false,
        error: "OG image is required.",
      };
    }

    if (!data.categoryId || !data.subcategoryId) {
      return {
        success: false,
        error: "Category and subcategory are required.",
      };
    }

    if (!data.content?.blocks?.length) {
      return {
        success: false,
        error: "Blog content cannot be empty.",
      };
    }

    // ========================================================
    // 4. DUPLICATE BLOG SLUG
    // ========================================================

    const existing = await prisma.blog.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A blog with this slug already exists.",
      };
    }

    // ========================================================
    // 5. VALIDATE CATEGORY + SUBCATEGORY
    // ========================================================

    const subcategory = await prisma.subcategory.findFirst({
      where: {
        id: data.subcategoryId,
        categoryId: data.categoryId,
        isActive: true,
      },

      select: {
        id: true,
        slug: true,

        category: {
          select: {
            id: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    if (!subcategory || !subcategory.category || !subcategory.category.isActive) {
      return {
        success: false,
        error: "Invalid category / subcategory combination.",
      };
    }

    const categorySlug = subcategory.category.slug;

    const subcategorySlug = subcategory.slug;

    // ========================================================
    // 6. CONTENT + SEO
    // ========================================================

    const contentText = extractTextFromContent(data.content);

    const seoData = await generateSEOWithAI(title, contentText);

    const readingTime = estimateReadingTime(data.content);

    // ========================================================
    // 7. CANONICAL URL
    // ========================================================

    const canonicalUrl = buildBlogUrl(categorySlug, subcategorySlug, slug);

    // ========================================================
    // 8. PUBLIC BLOG PATH
    // ========================================================

    const blogPath = `/${categorySlug}/${subcategorySlug}/${slug}`;

    // ========================================================
    // 9. STATUS
    // ========================================================

    const status = data.status || "DRAFT";

    const isPublished = status === "PUBLISHED";

    // ========================================================
    // 10. CREATE BLOG
    // ========================================================

    const blog = await prisma.blog.create({
      data: {
        title,

        slug,

        shortDescription: seoData.shortDescription,

        content: data.content,

        tableOfContents: data.tableOfContents ?? [],

        type: data.type || "ARTICLE",

        status,

        bannerImage: data.bannerImage,

        bannerImageAlt: data.bannerImageAlt || title,

        featured: data.featured ?? false,

        publishedAt: isPublished ? new Date() : null,

        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,

        authorId: user.id,

        categoryId: data.categoryId,

        subcategoryId: data.subcategoryId,

        readingTime,

        seo: {
          create: {
            metaTitle: seoData.metaTitle,

            metaDescription: seoData.metaDescription,

            canonicalUrl,

            noIndex: false,

            noFollow: false,

            ogTitle: title,

            ogDescription: seoData.ogDescription,

            ogImage: data.ogImage,

            twitterTitle: title,

            twitterDescription: seoData.twitterDescription,

            twitterImage: data.ogImage,

            schemaType: "Article",
          },
        },
      },

      include: {
        seo: true,
      },
    });

    // ========================================================
    // 11. DASHBOARD CACHE
    // ========================================================

    revalidatePath("/dashboard/blogs");

    // ========================================================
    // 12. PUBLIC CACHE
    // ========================================================

    if (isPublished) {
      revalidatePath("/");

      revalidateTag(CACHE_TAGS.home, "max");

      revalidateTag(CACHE_TAGS.categoryPageBlogs(categorySlug), "max");

      revalidateTag(CACHE_TAGS.subcategoryPageBlogs(subcategorySlug), "max");

      revalidateTag(CACHE_TAGS.blog(blog.slug), "max");

      revalidatePath(blogPath);

      // ======================================================
      // INDEXNOW
      // ======================================================

      try {
        await pingIndexNow(blogPath);
      } catch (indexNowError) {
        // IndexNow must never make a successful
        // blog creation appear to have failed.

        console.error("[createBlog] IndexNow notification failed:", indexNowError);
      }
    }

    // ========================================================
    // 13. SUCCESS
    // ========================================================

    return {
      success: true,

      data: {
        blog: {
          id: blog.id,

          title: blog.title,

          slug: blog.slug,

          shortDescription: blog.shortDescription,

          featured: blog.featured,

          status: blog.status,

          publishedAt: blog.publishedAt,

          createdAt: blog.createdAt,
        },

        seo: {
          metaTitle: blog.seo?.metaTitle ?? undefined,

          metaDescription: blog.seo?.metaDescription ?? undefined,

          canonicalUrl: blog.seo?.canonicalUrl ?? undefined,

          ogDescription: blog.seo?.ogDescription ?? undefined,

          twitterDescription: blog.seo?.twitterDescription ?? undefined,
        },

        aiGenerated: {
          shortDescription: seoData.shortDescription,

          keywords: seoData.keywords,

          summary: seoData.summary,
        },
      },
    };
  } catch (error) {
    console.error("❌ Create blog error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create blog",
    };
  }
}
