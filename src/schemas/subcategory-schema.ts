// src/schemas/subcategory-schema.ts
import { z } from "zod";

export const subcategorySchema = z.object({
  categoryId: z.string().min(1, "Please select a category."),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be under 100 characters."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .max(100, "Slug must be under 100 characters.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, with hyphens instead of spaces."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be under 500 characters.")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order can't be negative"),
});

export type SubcategoryFormValues = z.infer<typeof subcategorySchema>;
