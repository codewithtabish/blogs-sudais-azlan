// src/lib/validations/category-schema.ts

import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be under 80 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(80, "Slug must be under 80 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order can't be negative"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
