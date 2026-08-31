// src/app/actions/(editor)/create-editor-action.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";
import { EditorFormValues, editorSchema } from "@/schemas/editor-schema";
import { revalidateTag } from "next/cache";

// ---------------------------------------------------------
// Result types
// ---------------------------------------------------------

type CreateEditorSuccess = {
  success: true;
  editorId: string;
};

type CreateEditorError = {
  success: false;
  error: string;
  fieldErrors?: Partial<Record<keyof EditorFormValues, string>>;
};

export type CreateEditorResult = CreateEditorSuccess | CreateEditorError;

// ---------------------------------------------------------
// Create Editor
// ---------------------------------------------------------

export async function createEditorAction(values: EditorFormValues): Promise<CreateEditorResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  // -------------------------------------------------------
  // 1. Validate input
  // -------------------------------------------------------

  const parsed = editorSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof EditorFormValues, string>> = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof EditorFormValues | undefined;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      success: false,
      error: "Please fix the errors in the form.",
      fieldErrors,
    };
  }

  const { categoryIds, ...editorData } = parsed.data;

  try {
    const assignedCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { slug: true },
    });

    // -------------------------------------------------------
    // 2. Ensure the email isn't already taken
    // -------------------------------------------------------

    const existing = await prisma.editor.findUnique({
      where: { email: editorData.email },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        error: "An editor with this email already exists.",
        fieldErrors: { email: "This email is already in use." },
      };
    }

    // -------------------------------------------------------
    // 3. Create the editor + assign categories atomically
    // -------------------------------------------------------

    const editor = await prisma.$transaction(async (tx) => {
      const created = await tx.editor.create({
        data: {
          name: editorData.name,
          email: editorData.email,
          imageUrl: editorData.imageUrl || null,
          bio: editorData.bio || null,
          experience: editorData.experience || null,
          location: editorData.location || null,
          website: editorData.website || null,
          twitter: editorData.twitter || null,
          linkedin: editorData.linkedin || null,
          facebook: editorData.facebook || null,
          instagram: editorData.instagram || null,
          github: editorData.github || null,
          isActive: editorData.isActive,
        },
      });

      if (categoryIds.length > 0) {
        await tx.category.updateMany({
          where: { id: { in: categoryIds } },
          data: { editorId: created.id },
        });
      }

      return created;
    });

    // -------------------------------------------------------
    // 4. Revalidate cached category/editor lists
    // -------------------------------------------------------

    revalidateTag(CACHE_TAGS.categories, "max");
    revalidateTag(CACHE_TAGS.editors, "max");

    for (const category of assignedCategories) {
      revalidateTag(CACHE_TAGS.categoryPageBlogs(category.slug), "max");
    }

    return { success: true, editorId: editor.id };
  } catch (err) {
    console.error("[createEditor] Error:", err);

    return {
      success: false,
      error: "Failed to create editor. Please try again.",
    };
  }
}
