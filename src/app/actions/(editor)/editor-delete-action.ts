// src/app/actions/(editor)/delete-editor-action.ts

"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

type DeleteEditorResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function deleteEditorAction(editorId: string): Promise<DeleteEditorResult> {
  // ============================================================
  // 1. VALIDATE EDITOR ID
  // ============================================================

  if (!editorId?.trim()) {
    return {
      success: false,
      error: "Editor id is required.",
    };
  }

  try {
    // ============================================================
    // 2. CHECK EDITOR EXISTS
    // ============================================================

    const editor = await prisma.editor.findUnique({
      where: {
        id: editorId,
      },
      select: {
        id: true,
      },
    });

    if (!editor) {
      return {
        success: false,
        error: "Editor not found.",
      };
    }

    // ============================================================
    // 3. DELETE EDITOR
    //
    // Category.editorId uses onDelete: SetNull.
    //
    // Therefore:
    // - Editor is deleted
    // - Categories remain
    // - Their editorId becomes NULL
    //
    // No manual category update is required.
    // ============================================================

    await prisma.editor.delete({
      where: {
        id: editorId,
      },
    });

    // ============================================================
    // 4. REVALIDATE CACHE
    // ============================================================

    // Editor list changed.
    revalidateTag(CACHE_TAGS.editors, "max");

    // Categories changed because their editor assignment
    // may now be NULL.
    revalidateTag(CACHE_TAGS.categories, "max");

    // Dashboard pages.
    revalidatePath("/dashboard/editors");
    revalidatePath("/dashboard/category");

    // ============================================================
    // 5. SUCCESS
    // ============================================================

    return {
      success: true,
    };
  } catch (err) {
    console.error("[deleteEditorAction] Error:", err);

    return {
      success: false,
      error: "Failed to delete editor. Please try again.",
    };
  }
}
