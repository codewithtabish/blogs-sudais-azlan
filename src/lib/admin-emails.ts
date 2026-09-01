// ============================================================
// ADMIN EMAILS
// ============================================================
//
// Comma-separated admin emails from the environment:
//
// ADMIN_EMAILS=kashisultan099@gmail.com,tabish@codewithtabish.com,sudaisazlan09@gmail.com
//
// ============================================================

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Checks whether an email belongs to an authorized admin.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Returns the configured admin email allow-list.
 *
 * Useful when the complete list is needed internally.
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
}

// src/lib/admin-emails.ts

// Emails in this list are automatically made ADMIN on first sign-up.
// Keep entries lowercase — comparisons are case-insensitive via .toLowerCase().
export const ADMIN_EMAILS_TWO: string[] = [
  "kashisultan099@gmail.com",
  "tabish@codewithtabish.com",
  "sudaisazlan09@gmail.com",
].map((e) => e.toLowerCase());
