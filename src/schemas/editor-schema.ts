// src/lib/validations/editor-schema.ts

import { z } from "zod";

// A URL field that is allowed to be empty (cleared) but must be a
// valid URL when the user actually types something in.
const optionalUrl = z.string().trim().url("Please enter a valid URL").optional().or(z.literal(""));

export const editorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be under 80 characters"),

  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),

  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),

  bio: z.string().max(500, "Bio must be under 500 characters").optional().or(z.literal("")),

  experience: z
    .string()
    .max(1000, "Experience must be under 1000 characters")
    .optional()
    .or(z.literal("")),

  location: z
    .string()
    .max(120, "Location must be under 120 characters")
    .optional()
    .or(z.literal("")),

  website: optionalUrl,
  twitter: optionalUrl,
  linkedin: optionalUrl,
  facebook: optionalUrl,
  instagram: optionalUrl,
  github: optionalUrl,

  isActive: z.boolean(),

  // Category ids this editor should be assigned to.
  // An editor can own zero or more categories.
  categoryIds: z.array(z.string()).default([]),
});

export type EditorFormValues = z.infer<typeof editorSchema>;

// Sensible defaults for react-hook-form's `defaultValues`.
export const editorFormDefaultValues: EditorFormValues = {
  name: "",
  email: "",
  imageUrl: "",
  bio: "",
  experience: "",
  location: "",
  website: "",
  twitter: "",
  linkedin: "",
  facebook: "",
  instagram: "",
  github: "",
  isActive: true,
  categoryIds: [],
};
