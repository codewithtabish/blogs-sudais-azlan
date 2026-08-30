"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import { EditorFormValues, editorSchema } from "@/schemas/editor-schema";
import prisma from "@/lib/prisma-client";

type UpdateEditorSuccess = {
  success: true;
  editorId: string;
};

type UpdateEditorError = {
  success: false;
  error: string;
  fieldErrors?: Partial<Record<keyof EditorFormValues, string>>;
};

export type UpdateEditorResult = UpdateEditorSuccess | UpdateEditorError;

export async function updateEditorAction(
  editorId: string,
  values: EditorFormValues,
): Promise<UpdateEditorResult> {
  if (!editorId?.trim()) {
    return {
      success: false,
      error: "Editor id is required.",
    };
  }

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
    const existing = await prisma.editor.findUnique({
      where: { id: editorId },
      select: { id: true, email: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Editor not found.",
      };
    }

    // Email uniqueness (exclude self)
    if (editorData.email !== existing.email) {
      const emailTaken = await prisma.editor.findUnique({
        where: { email: editorData.email },
        select: { id: true },
      });

      if (emailTaken) {
        return {
          success: false,
          error: "An editor with this email already exists.",
          fieldErrors: { email: "This email is already in use." },
        };
      }
    }

    // Atomic update + category re-assignment
    // Category.editorId is one-to-many (onDelete: SetNull)
    await prisma.$transaction(async (tx) => {
      await tx.editor.update({
        where: { id: editorId },
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

      // Clear previous assignments
      await tx.category.updateMany({
        where: { editorId },
        data: { editorId: null },
      });

      // Assign new categories
      if (categoryIds.length > 0) {
        await tx.category.updateMany({
          where: { id: { in: categoryIds } },
          data: { editorId },
        });
      }
    });

    revalidateTag(CACHE_TAGS.editors, "max");
    revalidateTag(CACHE_TAGS.categories, "max");

    revalidatePath("/dashboard/editors");
    revalidatePath(`/dashboard/editors/${editorId}/edit`);
    revalidatePath("/dashboard/category");

    return {
      success: true,
      editorId,
    };
  } catch (err) {
    console.error("[updateEditorAction] Error:", err);

    return {
      success: false,
      error: "Failed to update editor. Please try again.",
    };
  }
}
