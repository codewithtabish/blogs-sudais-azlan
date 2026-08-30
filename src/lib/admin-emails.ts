// src/lib/admin-emails.ts

/**
 * Admin email allow-list.
 *
 * Configure in .env.local:
 *
 * ADMIN_EMAILS=email1@example.com,email2@example.com
 *
 * Emails are normalized to lowercase so comparisons
 * remain case-insensitive.
 */

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
