"use server";

import { z } from "zod";

import { NewsletterStatus } from "@/generated/prisma/enums";

import { sendWelcomeEmail } from "@/lib/resend-emai";
import prisma from "@/lib/prisma-client";

const subscribeNewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
});

export type SubscribeNewsletterResult =
  | {
      success: true;
      message: string;
      alreadySubscribed?: boolean;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: {
        email?: string[];
      };
    };

export async function subscribeNewsletterAction(email: string): Promise<SubscribeNewsletterResult> {
  console.log("========================================");
  console.log("[Newsletter] Subscription request started");
  console.log("[Newsletter] Raw email:", email);
  console.log("========================================");

  /**
   * ============================================================
   * VALIDATE EMAIL
   * ============================================================
   */

  const parsed = subscribeNewsletterSchema.safeParse({
    email,
  });

  if (!parsed.success) {
    console.error("[Newsletter] ❌ Invalid email:", parsed.error.flatten());

    return {
      success: false,
      message: "Please enter a valid email address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const normalizedEmail = parsed.data.email;

  console.log("[Newsletter] Normalized email:", normalizedEmail);

  try {
    /**
     * ============================================================
     * FIND EXISTING SUBSCRIBER
     * ============================================================
     */

    console.log("[Newsletter] Checking database for subscriber...");

    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    /**
     * ============================================================
     * EXISTING SUBSCRIBER
     * ============================================================
     */

    if (existingSubscriber) {
      console.log("[Newsletter] Existing subscriber found:");

      console.log({
        id: existingSubscriber.id,
        email: existingSubscriber.email,
        status: existingSubscriber.status,
        subscribedAt: existingSubscriber.subscribedAt,
        unsubscribedAt: existingSubscriber.unsubscribedAt,
      });

      /**
       * ----------------------------------------------------------
       * ALREADY SUBSCRIBED
       * ----------------------------------------------------------
       *
       * Do not create anything.
       * Do not send another welcome email.
       */

      if (existingSubscriber.status === NewsletterStatus.SUBSCRIBED) {
        console.log("[Newsletter] Subscriber is already SUBSCRIBED.");

        console.log("[Newsletter] Welcome email will NOT be sent again.");

        return {
          success: true,
          alreadySubscribed: true,
          message: "You're already subscribed to the newsletter.",
        };
      }

      /**
       * ----------------------------------------------------------
       * UNSUBSCRIBED
       * ----------------------------------------------------------
       *
       * Reactivate the subscriber immediately.
       *
       * There is NO pending/confirmation step.
       */

      if (existingSubscriber.status === NewsletterStatus.UNSUBSCRIBED) {
        console.log("[Newsletter] Subscriber is UNSUBSCRIBED.");

        console.log("[Newsletter] Reactivating subscription...");

        const updatedSubscriber = await prisma.newsletterSubscriber.update({
          where: {
            id: existingSubscriber.id,
          },
          data: {
            status: NewsletterStatus.SUBSCRIBED,
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        });

        console.log("[Newsletter] ✅ Subscriber reactivated:");

        console.log({
          id: updatedSubscriber.id,
          email: updatedSubscriber.email,
          status: updatedSubscriber.status,
          subscribedAt: updatedSubscriber.subscribedAt,
        });

        /**
         * --------------------------------------------------------
         * SEND WELCOME EMAIL
         * --------------------------------------------------------
         */

        console.log("========================================");
        console.log("[Newsletter] 📧 Sending welcome email after re-subscription...");
        console.log("[Newsletter] Recipient:", normalizedEmail);
        console.log("========================================");

        const emailResult = await sendWelcomeEmail(normalizedEmail);

        console.log("[Newsletter] Resend welcome email result:", emailResult);

        if (!emailResult.success) {
          console.error("[Newsletter] ❌ Welcome email failed:", emailResult.error);
        } else {
          console.log("[Newsletter] ✅ Welcome email sent successfully.");

          console.log("[Newsletter] Resend email ID:", emailResult.id);
        }

        return {
          success: true,
          message: "You're subscribed again. Welcome back!",
        };
      }
    }

    /**
     * ============================================================
     * NEW SUBSCRIBER
     * ============================================================
     *
     * No confirmation.
     *
     * New subscriber is immediately SUBSCRIBED.
     */

    console.log("[Newsletter] No existing subscriber found.");

    console.log("[Newsletter] Creating new SUBSCRIBED subscriber...");

    const newSubscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        status: NewsletterStatus.SUBSCRIBED,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      },
    });

    console.log("[Newsletter] ✅ Subscriber created successfully:");

    console.log({
      id: newSubscriber.id,
      email: newSubscriber.email,
      status: newSubscriber.status,
      subscribedAt: newSubscriber.subscribedAt,
    });

    /**
     * ============================================================
     * SEND WELCOME EMAIL
     * ============================================================
     */

    console.log("========================================");
    console.log("[Newsletter] 📧 Sending welcome email...");
    console.log("[Newsletter] Recipient:", normalizedEmail);
    console.log("========================================");

    const emailResult = await sendWelcomeEmail(normalizedEmail);

    /**
     * Log complete Resend/helper result.
     */

    console.log("========================================");
    console.log("[Newsletter] Resend welcome email result:");
    console.log(emailResult);
    console.log("========================================");

    if (!emailResult.success) {
      console.error("[Newsletter] ❌ Welcome email FAILED.");

      console.error("[Newsletter] Resend/helper error:", emailResult.error);

      /**
       * The subscriber is still successfully subscribed.
       *
       * Email failure does not roll back the database record.
       */
    } else {
      console.log("[Newsletter] ✅ Welcome email SENT successfully.");

      console.log("[Newsletter] Resend email ID:", emailResult.id);
    }

    /**
     * ============================================================
     * COMPLETE
     * ============================================================
     */

    console.log("========================================");
    console.log("[Newsletter] Subscription process completed.");
    console.log("[Newsletter] Email:", normalizedEmail);
    console.log("[Newsletter] Database status:", NewsletterStatus.SUBSCRIBED);
    console.log("[Newsletter] Email result:", emailResult.success ? "SENT" : "FAILED");
    console.log("========================================");

    return {
      success: true,
      message: "You're subscribed! Welcome to The Daily.",
    };
  } catch (error) {
    console.error("========================================");
    console.error("[Newsletter] ❌ Subscription process failed.");
    console.error("[Newsletter] Error:", error);
    console.error("========================================");

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
