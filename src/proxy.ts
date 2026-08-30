// src/proxy.ts

import { clerkClient, clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboardRoute) {
    const { sessionClaims, userId } = await auth.protect(); // must be signed in first

    let role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

    // Fallback: sessionClaims.metadata only exists if you've added a custom
    // claim in Clerk Dashboard → Sessions → Customize session token.
    // Without that, this hits Clerk's API directly so it doesn't silently fail.
    if (!role && userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      role = (user.publicMetadata as { role?: string } | undefined)?.role;
    }

    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
