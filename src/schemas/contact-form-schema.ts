import { z } from "zod";

export const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be 50 characters or fewer."),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be 50 characters or fewer."),

  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .max(254, "Email address is too long."),

  country: z
    .string()
    .trim()
    .min(1, "Please select a country.")
    .length(2, "Please select a valid country."),

  message: z
    .string()
    .trim()
    .min(1, "Please enter a message.")
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message must be 5,000 characters or fewer."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
