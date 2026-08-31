"use server";

import { currentUser } from "@clerk/nextjs/server";
import { ADMIN_EMAILS } from "@/lib/admin-emails";

export async function checkIsAdminAction(): Promise<boolean> {
  const user = await currentUser();

  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();

  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email);
}
