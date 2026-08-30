"use server";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";

export type EditorCategory = {
  id: string;
  name: string;
  slug: string;
};

export type EditorListItem = {
  id: string;
  name: string;
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
  categories: EditorCategory[];
  categoryCount: number;
  createdAt: Date;
};

type GetAllEditorsResult =
  | {
      success: true;
      editors: EditorListItem[];
    }
  | {
      success: false;
      error: string;
    };

async function getCachedEditors(): Promise<EditorListItem[]> {
  "use cache";

  cacheLife("max");
  cacheTag(CACHE_TAGS.editors);

  const editors = await prisma.editor.findMany({
    select: {
      id: true,
      name: true,
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

      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },

    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });

  return editors.map((editor) => ({
    id: editor.id,
    name: editor.name,
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
    categories: editor.categories,
    categoryCount: editor.categories.length,
    createdAt: editor.createdAt,
  }));
}

export async function getAllEditorsAction(): Promise<GetAllEditorsResult> {
  try {
    const editors = await getCachedEditors();

    return {
      success: true,
      editors,
    };
  } catch (error) {
    console.error("[getAllEditorsAction] Error:", error);

    return {
      success: false,
      error: "Failed to load editors.",
    };
  }
}
