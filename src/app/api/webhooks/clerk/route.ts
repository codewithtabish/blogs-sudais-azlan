// src/app/api/webhooks/clerk/route.ts

import { ADMIN_EMAILS_TWO } from "@/lib/admin-emails";
import { CACHE_TAGS } from "@/lib/cache-keys";
import prisma from "@/lib/prisma-client";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Clerk Webhook] Missing CLERK_WEBHOOK_SIGNING_SECRET");
    return new Response("Missing CLERK_WEBHOOK_SIGNING_SECRET", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("[Clerk Webhook] Missing Svix headers", {
      svixId,
      svixTimestamp,
      svixSignature,
    });
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.text();

  console.log("[Clerk Webhook] Payload length:", payload.length);

  if (!payload) {
    console.error("[Clerk Webhook] Empty payload — body was likely already consumed upstream");
    return new Response("Empty payload", { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  // IMPORTANT: verify()'s job here is purely to validate the signature and
  // throw if it's invalid. In this project it has been observed to return
  // `undefined` on success instead of the parsed payload (a svix/runtime
  // quirk), so we do NOT rely on its return value for the event data —
  // we parse `payload` ourselves right after a successful verification.
  try {
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("[Clerk Webhook] Verification failed:", err);
    return new Response("Invalid webhook", { status: 400 });
  }

  let evt: WebhookEvent;
  try {
    evt = JSON.parse(payload) as WebhookEvent;
  } catch (parseErr) {
    console.error("[Clerk Webhook] Failed to parse verified payload:", parseErr);
    return new Response("Invalid payload JSON", { status: 400 });
  }

  if (!evt || !evt.type) {
    console.error("[Clerk Webhook] Parsed payload has no type:", evt);
    return new Response("Invalid webhook payload", { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      // ─────────────────────────────────────────────
      // User created (first sign-up)
      // ─────────────────────────────────────────────
      case "user.created": {
        const data = evt.data;

        const email =
          data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
            ?.email_address ??
          data.email_addresses?.[0]?.email_address ??
          null;

        // Skip if no email — avoids unique constraint crash
        if (!email) {
          console.warn("[Clerk Webhook] user.created without email, skipping:", data.id);
          break;
        }

        // Auto-promote to ADMIN if the email is in the allow-list
        const role: "USER" | "ADMIN" = ADMIN_EMAILS_TWO.includes(email.toLowerCase())
          ? "ADMIN"
          : "USER";

        // Both clerkId and email are unique columns, so a plain upsert()
        // (which only matches on clerkId) can throw P2002 if the email is
        // already taken by a *different* row — e.g. the user was deleted
        // and re-created in Clerk with a new clerkId, or a stale row was
        // left behind. Check both keys ourselves and decide what to do.
        const existingByClerkId = await prisma.user.findUnique({
          where: { clerkId: data.id },
        });

        if (existingByClerkId) {
          // Row already exists for this Clerk user — just refresh it.
          await prisma.user.update({
            where: { clerkId: data.id },
            data: {
              firstName: data.first_name ?? null,
              lastName: data.last_name ?? null,
              email,
              imageUrl: data.image_url ?? null,
              lastLoginAt: new Date(),
              lastSeenAt: new Date(),
            },
          });
        } else {
          const existingByEmail = await prisma.user.findUnique({
            where: { email },
          });

          if (existingByEmail) {
            // Same email, different (new) clerkId — most likely the Clerk
            // account was deleted and re-created. Re-link the existing row
            // to the new clerkId instead of trying to insert a duplicate.
            console.warn("[Clerk Webhook] user.created email already exists, relinking clerkId:", {
              oldClerkId: existingByEmail.clerkId,
              newClerkId: data.id,
              email,
            });
            await prisma.user.update({
              where: { email },
              data: {
                clerkId: data.id,
                firstName: data.first_name ?? null,
                lastName: data.last_name ?? null,
                imageUrl: data.image_url ?? null,
                lastLoginAt: new Date(),
                lastSeenAt: new Date(),
              },
            });
          } else {
            // Genuinely new user.
            await prisma.user.create({
              data: {
                clerkId: data.id,
                firstName: data.first_name ?? null,
                lastName: data.last_name ?? null,
                email,
                imageUrl: data.image_url ?? null,
                role,
                lastLoginAt: new Date(),
                lastSeenAt: new Date(),
              },
            });
          }
        }

        revalidateTag(CACHE_TAGS.users, "max");

        // Mirror role into Clerk publicMetadata so middleware can read it
        // straight from the session token, with no DB call needed.
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(data.id, {
            publicMetadata: { role },
          });
        } catch (metaErr) {
          console.error("[Clerk Webhook] Failed to sync metadata for", data.id, metaErr);
        }

        console.log("[Clerk Webhook] User created:", data.id, "role:", role);
        break;
      }

      // ─────────────────────────────────────────────
      // Profile updated (name, email, avatar…)
      // Does NOT touch lastLoginAt / lastSeenAt
      // ─────────────────────────────────────────────
      case "user.updated": {
        const data = evt.data;

        const email =
          data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
            ?.email_address ??
          data.email_addresses?.[0]?.email_address ??
          null;

        try {
          await prisma.user.updateMany({
            where: { clerkId: data.id },
            data: {
              firstName: data.first_name ?? null,
              lastName: data.last_name ?? null,
              ...(email ? { email } : {}), // only update email if present
              imageUrl: data.image_url ?? null,
            },
          });
        } catch (updateErr) {
          // Most likely the new email collides with another row's unique
          // email constraint. Log and continue rather than 500ing the
          // whole webhook (Clerk will otherwise keep retrying delivery).
          console.error("[Clerk Webhook] user.updated failed, likely email conflict:", {
            clerkId: data.id,
            email,
            error: updateErr,
          });
          break;
        }

        revalidateTag(CACHE_TAGS.users, "max");
        revalidatePath("/dashboard/users");

        console.log("[Clerk Webhook] User updated:", data.id);
        break;
      }

      // ─────────────────────────────────────────────
      // New session = actual login
      // ─────────────────────────────────────────────
      case "session.created": {
        const data = evt.data as { user_id: string };

        if (data.user_id) {
          await prisma.user.updateMany({
            where: { clerkId: data.user_id },
            data: {
              lastLoginAt: new Date(),
              lastSeenAt: new Date(),
            },
          });
          revalidateTag(CACHE_TAGS.users, "max");
          revalidatePath("/dashboard/users");

          console.log("[Clerk Webhook] Login tracked:", data.user_id);
        }
        break;
      }

      // ─────────────────────────────────────────────
      // User deleted in Clerk
      // ─────────────────────────────────────────────
      case "user.deleted": {
        const data = evt.data;

        if (data.id) {
          await prisma.user.deleteMany({
            where: { clerkId: data.id },
          });
          console.log("[Clerk Webhook] User deleted:", data.id);
          revalidateTag(CACHE_TAGS.users, "max");
          revalidatePath("/dashboard/users");
        }
        break;
      }

      default:
        // Intentionally ignore other events
        break;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Clerk Webhook] Error:", error);
    return new Response("Webhook Error: " + (error as Error).message, {
      status: 500,
    });
  }
}
