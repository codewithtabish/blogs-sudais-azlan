"use server";

import prisma from "@/lib/prisma-client";

export type EditorDetail = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  experience: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  github: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** IDs of categories currently assigned to this editor */
  categoryIds: string[];
};

type GetEditorByIdSuccess = {
  success: true;
  editor: EditorDetail;
};

type GetEditorByIdError = {
  success: false;
  error: string;
};

export type GetEditorByIdResult = GetEditorByIdSuccess | GetEditorByIdError;

export async function getEditorByIdAction(editorId: string): Promise<GetEditorByIdResult> {
  if (!editorId?.trim()) {
    return {
      success: false,
      error: "Editor id is required.",
    };
  }

  try {
    const editor = await prisma.editor.findUnique({
      where: { id: editorId },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        bio: true,
        experience: true,
        location: true,
        website: true,
        twitter: true,
        linkedin: true,
        facebook: true,
        instagram: true,
        github: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: { id: true },
        },
      },
    });

    if (!editor) {
      return {
        success: false,
        error: "Editor not found.",
      };
    }

    return {
      success: true,
      editor: {
        id: editor.id,
        name: editor.name,
        email: editor.email,
        imageUrl: editor.imageUrl,
        bio: editor.bio,
        experience: editor.experience,
        location: editor.location,
        website: editor.website,
        twitter: editor.twitter,
        linkedin: editor.linkedin,
        facebook: editor.facebook,
        instagram: editor.instagram,
        github: editor.github,
        isActive: editor.isActive,
        createdAt: editor.createdAt,
        updatedAt: editor.updatedAt,
        categoryIds: editor.categories.map((c) => c.id),
      },
    };
  } catch (err) {
    console.error("[getEditorByIdAction] Error:", err);
    return {
      success: false,
      error: "Failed to load editor.",
    };
  }
}
