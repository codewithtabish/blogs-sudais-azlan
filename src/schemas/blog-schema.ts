import { z } from "zod";

// ============================================================
// TABLE OF CONTENTS
// ============================================================
export type TableOfContentsItem = {
  id: string;
  title: string;
  slug: string;
  level?: number;
};

// ============================================================
// CREATE BLOG INPUT (used in server action)
// ============================================================
export type CreateBlogInput = {
  title: string;
  slug: string;
  content: any; // Editor.js data
  bannerImage: string;
  bannerImageAlt?: string;
  ogImage: string;
  categoryId: string;
  subcategoryId: string;
  type?: "ARTICLE" | "NEWS" | "OPINION" | "ANALYSIS" | "GUIDE" | "REVIEW" | "INTERVIEW";
  status?: "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  featured?: boolean;
  tableOfContents?: TableOfContentsItem[];
  scheduledAt?: string | null;
};

// ============================================================
// SERVER ACTION RESULT
// ============================================================
export type CreateBlogSuccess = {
  success: true;
  data: {
    blog: {
      id: string;
      title: string;
      slug: string;
      shortDescription: string | null;
      featured: boolean;
      status: string;
      publishedAt: Date | null;
      createdAt: Date;
    };
    seo: {
      metaTitle: string | undefined;
      metaDescription: string | undefined;
      canonicalUrl: string | undefined;
      ogDescription: string | undefined;
      twitterDescription: string | undefined;
    };
    aiGenerated: {
      shortDescription: string;
      keywords: string[];
      summary: string;
    };
  };
};

export type CreateBlogError = {
  success: false;
  error: string;
};

export type CreateBlogResult = CreateBlogSuccess | CreateBlogError;

// ============================================================
// ZOD SCHEMA (for form validation)
// ============================================================
export const createBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120, "Title is too long"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers and hyphens",
    ),
  bannerImage: z.string().url("Banner image is required"),
  ogImage: z.string().url("OG image is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  type: z
    .enum(["ARTICLE", "NEWS", "OPINION", "ANALYSIS", "GUIDE", "REVIEW", "INTERVIEW"])
    .default("ARTICLE"),
  status: z.enum(["DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  tableOfContents: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        slug: z.string().min(1),
        level: z.number().optional(),
      }),
    )
    .optional()
    .default([]),
});

export type CreateBlogFormValues = z.infer<typeof createBlogSchema>;
