"use server";

import { Resend } from "resend";

// ============================================================
// INSIDER Newsletter Configuration
// ============================================================

const FROM_EMAIL = "Sudais Azlan <newsletter@sudaisazlan.com>";

const INSIDER_URL = "https://insider.sudaisazlan.com";

const INSIDER_PRIMARY = "#09367d";
const INSIDER_PRIMARY_DARK = "#06275f";

// ============================================================
// Result Types
// ============================================================

type SendWelcomeEmailResult =
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      error: string;
    };

// ============================================================
// Send Newsletter Welcome Email
// ============================================================

export async function sendWelcomeEmail(email: string): Promise<SendWelcomeEmailResult> {
  console.log("========================================");
  console.log("[INSIDER Newsletter] Starting welcome email");
  console.log("========================================");

  const normalizedEmail = email.trim().toLowerCase();

  console.log("[INSIDER Newsletter] Recipient:", normalizedEmail);
  console.log("[INSIDER Newsletter] From:", FROM_EMAIL);
  console.log("[INSIDER Newsletter] RESEND_API_KEY exists:", Boolean(process.env.RESEND_API_KEY));

  // ==========================================================
  // 1. Validate email
  // ==========================================================

  if (!normalizedEmail) {
    console.error("[INSIDER Newsletter] No email address provided.");

    return {
      success: false,
      error: "Email address is required.",
    };
  }

  // ==========================================================
  // 2. Validate Resend configuration
  // ==========================================================

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("[INSIDER Newsletter] RESEND_API_KEY is missing from environment variables.");

    return {
      success: false,
      error: "Email service is not configured.",
    };
  }

  // ==========================================================
  // 3. Create Resend client
  // ==========================================================

  const resend = new Resend(resendApiKey);

  const currentYear = new Date().getFullYear();

  // ==========================================================
  // 4. Send welcome email
  // ==========================================================

  try {
    console.log("[INSIDER Newsletter] Calling Resend...");

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [normalizedEmail],
      subject: "Welcome to INSIDER — Sudais Azlan",

      html: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <meta
      name="color-scheme"
      content="light"
    />

    <meta
      name="supported-color-schemes"
      content="light"
    />

    <title>Welcome to INSIDER</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: #f3f5f8;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
    "
  >

    <!-- Preheader -->

    <div
      style="
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
        font-size: 1px;
        line-height: 1px;
      "
    >
      Welcome to INSIDER — practical technology, AI, software engineering,
      development insights, and useful ideas from Sudais Azlan.
    </div>

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: #f3f5f8;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding: 48px 16px;
          "
        >

          <!-- Main container -->

          <table
            role="presentation"
            width="620"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width: 100%;
              max-width: 620px;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
            "
          >

            <!-- Brand header -->

            <tr>
              <td
                style="
                  padding: 28px 30px;
                  border-bottom: 1px solid #e5e7eb;
                "
              >

                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>

                    <td align="left">

                      <a
                        href="${INSIDER_URL}"
                        target="_blank"
                        style="
                          display: inline-block;
                          color: #111827;
                          text-decoration: none;
                        "
                      >

                        <span
                          style="
                            display: inline-block;
                            padding: 8px 13px;
                            border-top: 2px solid ${INSIDER_PRIMARY};
                            border-bottom: 2px solid ${INSIDER_PRIMARY};
                            color: #111827;
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 22px;
                            line-height: 1;
                            font-weight: 900;
                            letter-spacing: -1.4px;
                          "
                        >
                          INSIDER
                        </span>

                      </a>

                    </td>

                    <td
                      align="right"
                      valign="middle"
                      style="
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 11px;
                        line-height: 1.4;
                        font-weight: 700;
                        letter-spacing: 1.5px;
                        text-transform: uppercase;
                        color: #6b7280;
                      "
                    >
                      Sudais Azlan
                    </td>

                  </tr>
                </table>

              </td>
            </tr>

            <!-- Accent -->

            <tr>
              <td
                style="
                  height: 4px;
                  background-color: ${INSIDER_PRIMARY};
                  font-size: 0;
                  line-height: 0;
                "
              >
                &nbsp;
              </td>
            </tr>

            <!-- Main content -->

            <tr>
              <td
                style="
                  padding: 52px 34px 46px;
                "
              >

                <!-- Eyebrow -->

                <p
                  style="
                    margin: 0 0 14px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 11px;
                    line-height: 1.4;
                    font-weight: 700;
                    letter-spacing: 2.2px;
                    text-transform: uppercase;
                    color: ${INSIDER_PRIMARY_DARK};
                  "
                >
                  Welcome to INSIDER
                </p>

                <!-- Heading -->

                <h1
                  style="
                    margin: 0 0 22px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 38px;
                    line-height: 1.08;
                    font-weight: 800;
                    letter-spacing: -1.6px;
                    color: #111827;
                  "
                >
                  You're officially in.
                </h1>

                <!-- Intro -->

                <p
                  style="
                    margin: 0 0 20px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 17px;
                    line-height: 1.7;
                    color: #374151;
                  "
                >
                  Thanks for subscribing to
                  <strong style="color: #111827;">
                    INSIDER
                  </strong>
                  by Sudais Azlan.
                </p>

                <p
                  style="
                    margin: 0 0 20px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 16px;
                    line-height: 1.75;
                    color: #4b5563;
                  "
                >
                  You'll receive practical insights about
                  artificial intelligence, software engineering,
                  web development, mobile app development,
                  developer tools, and modern technology.
                </p>

                <p
                  style="
                    margin: 0 0 34px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 16px;
                    line-height: 1.75;
                    color: #4b5563;
                  "
                >
                  INSIDER is built around useful knowledge,
                  practical development ideas, technology,
                  projects, and thoughtful perspectives without
                  unnecessary noise.
                </p>

                <!-- CTA -->

                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>

                    <td
                      style="
                        background-color: ${INSIDER_PRIMARY};
                        border-radius: 7px;
                      "
                    >

                      <a
                        href="${INSIDER_URL}"
                        target="_blank"
                        style="
                          display: inline-block;
                          padding: 15px 25px;
                          border-radius: 7px;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 14px;
                          line-height: 1;
                          font-weight: 700;
                          color: #ffffff;
                          text-decoration: none;
                        "
                      >
                        Explore INSIDER

                        <span
                          style="
                            padding-left: 5px;
                            font-size: 15px;
                          "
                        >
                          →
                        </span>
                      </a>

                    </td>

                  </tr>
                </table>

                <!-- What to expect -->

                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    margin-top: 42px;
                  "
                >
                  <tr>

                    <td
                      style="
                        padding: 20px;
                        border-left: 3px solid ${INSIDER_PRIMARY};
                        background-color: #f7f9fc;
                      "
                    >

                      <p
                        style="
                          margin: 0 0 7px;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 11px;
                          line-height: 1.4;
                          font-weight: 700;
                          letter-spacing: 1.6px;
                          text-transform: uppercase;
                          color: ${INSIDER_PRIMARY_DARK};
                        "
                      >
                        What to expect
                      </p>

                      <p
                        style="
                          margin: 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 14px;
                          line-height: 1.7;
                          color: #4b5563;
                        "
                      >
                        AI insights, software engineering guides,
                        development tips, useful tools, project
                        updates, web and mobile development,
                        and practical ideas for building better
                        digital products.
                      </p>

                    </td>

                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->

            <tr>
              <td
                style="
                  padding: 28px 30px;
                  border-top: 1px solid #e5e7eb;
                  background-color: #f9fafb;
                "
              >

                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >
                  <tr>

                    <td align="center">

                      <p
                        style="
                          margin: 0 0 10px;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 11px;
                          line-height: 1.6;
                          font-weight: 700;
                          letter-spacing: 1.5px;
                          text-transform: uppercase;
                          color: #4b5563;
                        "
                      >
                        INSIDER
                      </p>

                      <p
                        style="
                          margin: 0 0 8px;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 12px;
                          line-height: 1.6;
                          color: #6b7280;
                        "
                      >
                        Technology, AI, software engineering,
                        web, mobile, and development.
                      </p>

                      <p
                        style="
                          margin: 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 11px;
                          line-height: 1.6;
                          color: #9ca3af;
                        "
                      >
                        You received this email because you
                        subscribed to the INSIDER newsletter.
                      </p>

                      <p
                        style="
                          margin: 8px 0 0;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 11px;
                          line-height: 1.6;
                          color: #9ca3af;
                        "
                      >
                        © ${currentYear} Sudais Azlan
                      </p>

                    </td>

                  </tr>
                </table>

              </td>
            </tr>

          </table>

          <!-- Bottom brand link -->

          <table
            role="presentation"
            width="620"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width: 100%;
              max-width: 620px;
            "
          >
            <tr>

              <td
                align="center"
                style="
                  padding: 18px 20px 0;
                "
              >

                <a
                  href="${INSIDER_URL}"
                  target="_blank"
                  style="
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 11px;
                    line-height: 1.5;
                    color: #6b7280;
                    text-decoration: none;
                  "
                >
                  insider.sudaisazlan.com
                </a>

              </td>

            </tr>
          </table>

        </td>
      </tr>
    </table>

  </body>
</html>
      `,
    });

    console.log("[INSIDER Newsletter] Resend response received.");

    // ========================================================
    // 5. Handle Resend error
    // ========================================================

    if (error) {
      console.error("[INSIDER Newsletter] Resend returned an error:", error);

      return {
        success: false,
        error: error.message,
      };
    }

    // ========================================================
    // 6. Validate Resend response
    // ========================================================

    console.log("[INSIDER Newsletter] Resend accepted the email.");
    console.log("[INSIDER Newsletter] Email ID:", data?.id);

    if (!data?.id) {
      console.error("[INSIDER Newsletter] Resend did not return an email ID.");

      return {
        success: false,
        error: "Resend did not return an email ID.",
      };
    }

    // ========================================================
    // 7. Success
    // ========================================================

    console.log("========================================");
    console.log("[INSIDER Newsletter] SUCCESS");
    console.log("[INSIDER Newsletter] Email ID:", data.id);
    console.log("[INSIDER Newsletter] Recipient:", normalizedEmail);
    console.log("========================================");

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error("[INSIDER Newsletter] Exception while sending email:", error);

    return {
      success: false,
      error: "Failed to send welcome email.",
    };
  }
}
