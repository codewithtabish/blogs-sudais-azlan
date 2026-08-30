// src/app/actions/contact-action.ts

"use server";

import { countries } from "@/data/country-list";
import { ContactFormValues, contactSchema } from "@/schemas/contact-form-schema";
import { Resend } from "resend";

interface SendContactMessageResult {
  success: boolean;
  message: string;
}

// ============================================================
// CONFIG
// ============================================================

const SITE_NAME = "Insider";
const SITE_DOMAIN = "insider.sudaisazlan.com";
const DEFAULT_CONTACT_EMAIL = "tabish@codewithtabish.com";

// ============================================================
// TYPES / HELPERS
// ============================================================

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================
// ADMIN EMAIL
// ============================================================

function buildAdminEmailHtml(values: ContactFormValues, countryName: string): string {
  const firstName = escapeHtml(values.firstName);
  const lastName = escapeHtml(values.lastName);
  const email = escapeHtml(values.email);
  const country = escapeHtml(countryName);
  const message = escapeHtml(values.message).replace(/\n/g, "<br />");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message — ${SITE_NAME}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#f5f5f4;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  "
>
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background-color:#f5f5f4;padding:40px 16px;"
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:560px;
            background-color:#ffffff;
            border-radius:12px;
            overflow:hidden;
            border:1px solid #e7e5e4;
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              style="
                padding:32px 40px 24px 40px;
                border-bottom:1px solid #e7e5e4;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:13px;
                  font-weight:600;
                  letter-spacing:0.18em;
                  text-transform:uppercase;
                  color:#111827;
                "
              >
                ${SITE_NAME}
              </p>

              <h1
                style="
                  margin:8px 0 0 0;
                  font-size:22px;
                  font-weight:700;
                  letter-spacing:-0.01em;
                  color:#1c1917;
                "
              >
                New Contact Message
              </h1>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:24px 40px;">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
              >

                <!-- FIRST NAME -->
                <tr>
                  <td style="padding-bottom:16px;">
                    <p
                      style="
                        margin:0 0 4px 0;
                        font-size:12px;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:0.08em;
                        color:#78716c;
                      "
                    >
                      First Name
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:15px;
                        color:#1c1917;
                      "
                    >
                      ${firstName}
                    </p>
                  </td>
                </tr>

                <!-- LAST NAME -->
                <tr>
                  <td style="padding-bottom:16px;">
                    <p
                      style="
                        margin:0 0 4px 0;
                        font-size:12px;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:0.08em;
                        color:#78716c;
                      "
                    >
                      Last Name
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:15px;
                        color:#1c1917;
                      "
                    >
                      ${lastName}
                    </p>
                  </td>
                </tr>

                <!-- EMAIL -->
                <tr>
                  <td style="padding-bottom:16px;">
                    <p
                      style="
                        margin:0 0 4px 0;
                        font-size:12px;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:0.08em;
                        color:#78716c;
                      "
                    >
                      Email
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:15px;
                        color:#1c1917;
                      "
                    >
                      <a
                        href="mailto:${email}"
                        style="
                          color:#111827;
                          text-decoration:none;
                        "
                      >
                        ${email}
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- COUNTRY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p
                      style="
                        margin:0 0 4px 0;
                        font-size:12px;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:0.08em;
                        color:#78716c;
                      "
                    >
                      Country
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:15px;
                        color:#1c1917;
                      "
                    >
                      ${country}
                    </p>
                  </td>
                </tr>

                <!-- MESSAGE -->
                <tr>
                  <td
                    style="
                      padding-top:20px;
                      border-top:1px solid #e7e5e4;
                    "
                  >
                    <p
                      style="
                        margin:0 0 8px 0;
                        font-size:12px;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:0.08em;
                        color:#78716c;
                      "
                    >
                      Message
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:15px;
                        line-height:1.6;
                        color:#1c1917;
                        white-space:pre-wrap;
                      "
                    >
                      ${message}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              style="
                padding:20px 40px;
                background-color:#fafaf9;
                border-top:1px solid #e7e5e4;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:12px;
                  color:#a8a29e;
                "
              >
                This message was submitted via the contact form on
                ${SITE_DOMAIN}.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================================
// USER CONFIRMATION EMAIL
// ============================================================

function buildConfirmationEmailHtml(values: ContactFormValues, countryName: string): string {
  const firstName = escapeHtml(values.firstName);
  const lastName = escapeHtml(values.lastName);
  const country = escapeHtml(countryName);
  const message = escapeHtml(values.message).replace(/\n/g, "<br />");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message — ${SITE_NAME}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#f5f5f4;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
  "
>
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background-color:#f5f5f4;padding:40px 16px;"
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:560px;
            background-color:#ffffff;
            border-radius:12px;
            overflow:hidden;
            border:1px solid #e7e5e4;
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              style="
                padding:32px 40px 24px 40px;
                border-bottom:1px solid #e7e5e4;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:13px;
                  font-weight:600;
                  letter-spacing:0.18em;
                  text-transform:uppercase;
                  color:#111827;
                "
              >
                ${SITE_NAME}
              </p>

              <h1
                style="
                  margin:8px 0 0 0;
                  font-size:24px;
                  font-weight:700;
                  letter-spacing:-0.02em;
                  color:#1c1917;
                "
              >
                We received your message
              </h1>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:28px 40px;">

              <p
                style="
                  margin:0 0 16px 0;
                  font-size:16px;
                  line-height:1.6;
                  color:#1c1917;
                "
              >
                Hi ${firstName},
              </p>

              <p
                style="
                  margin:0 0 24px 0;
                  font-size:15px;
                  line-height:1.7;
                  color:#57534e;
                "
              >
                Thanks for contacting ${SITE_NAME}. We've successfully
                received your message and will get back to you as soon
                as possible.
              </p>

              <!-- SUBMISSION -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border:1px solid #e7e5e4;
                  border-radius:8px;
                  overflow:hidden;
                "
              >

                <tr>
                  <td
                    style="
                      padding:16px 20px;
                      background-color:#fafaf9;
                      border-bottom:1px solid #e7e5e4;
                    "
                  >
                    <p
                      style="
                        margin:0;
                        font-size:12px;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:0.08em;
                        color:#78716c;
                      "
                    >
                      Your submission
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px;">

                    <!-- NAME -->
                    <p
                      style="
                        margin:0 0 14px 0;
                        font-size:14px;
                        color:#57534e;
                      "
                    >
                      <strong style="color:#1c1917;">
                        Name:
                      </strong>
                      ${firstName} ${lastName}
                    </p>

                    <!-- COUNTRY -->
                    <p
                      style="
                        margin:0 0 14px 0;
                        font-size:14px;
                        color:#57534e;
                      "
                    >
                      <strong style="color:#1c1917;">
                        Country:
                      </strong>
                      ${country}
                    </p>

                    <!-- MESSAGE -->
                    <div
                      style="
                        padding-top:16px;
                        border-top:1px solid #e7e5e4;
                      "
                    >
                      <p
                        style="
                          margin:0 0 8px 0;
                          font-size:12px;
                          font-weight:600;
                          text-transform:uppercase;
                          letter-spacing:0.08em;
                          color:#78716c;
                        "
                      >
                        Message
                      </p>

                      <p
                        style="
                          margin:0;
                          font-size:15px;
                          line-height:1.7;
                          color:#1c1917;
                          white-space:pre-wrap;
                        "
                      >
                        ${message}
                      </p>
                    </div>

                  </td>
                </tr>

              </table>

              <p
                style="
                  margin:24px 0 0 0;
                  font-size:14px;
                  line-height:1.7;
                  color:#78716c;
                "
              >
                Please keep this email for your records. If you need
                to provide additional information, simply reply to
                this email.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              style="
                padding:20px 40px;
                background-color:#fafaf9;
                border-top:1px solid #e7e5e4;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:12px;
                  line-height:1.6;
                  color:#a8a29e;
                "
              >
                This is an automated confirmation from ${SITE_NAME}.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================================
// SEND CONTACT MESSAGE
// ============================================================

export async function sendContactMessageAction(
  values: ContactFormValues,
): Promise<SendContactMessageResult> {
  // ==========================================================
  // 1. VALIDATE FORM
  // ==========================================================

  const parsed = contactSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "Unable to send your message. Please try again.",
    };
  }

  // ==========================================================
  // 2. ENVIRONMENT VARIABLES
  // ==========================================================

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.CONTACT_EMAIL ?? DEFAULT_CONTACT_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error(
      "Contact form: missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable.",
    );

    return {
      success: false,
      message: "Unable to send your message. Please try again.",
    };
  }

  // ==========================================================
  // 3. COUNTRY
  // ==========================================================

  const country = countries.find((country) => country.code === parsed.data.country);

  const countryName = country ? country.name : parsed.data.country;

  // ==========================================================
  // 4. SEND EMAILS
  // ==========================================================

  try {
    const resend = new Resend(apiKey);

    // ========================================================
    // ADMIN NOTIFICATION
    // ========================================================

    const { error: adminError } = await resend.emails.send({
      from: `${SITE_NAME} <${fromEmail}>`,
      to: [toEmail],
      replyTo: parsed.data.email,
      subject: `New Contact Message from ${parsed.data.firstName} ${parsed.data.lastName}`,
      html: buildAdminEmailHtml(parsed.data, countryName),
    });

    if (adminError) {
      console.error(
        "Contact form: Resend returned an error while sending admin email.",
        adminError,
      );

      return {
        success: false,
        message: "Unable to send your message. Please try again.",
      };
    }

    // ========================================================
    // USER CONFIRMATION
    // ========================================================

    const { error: confirmationError } = await resend.emails.send({
      from: `${SITE_NAME} <${fromEmail}>`,
      to: [parsed.data.email],
      replyTo: toEmail,
      subject: `We received your message — ${SITE_NAME}`,
      html: buildConfirmationEmailHtml(parsed.data, countryName),
    });

    if (confirmationError) {
      console.error("Contact form: confirmation email failed.", confirmationError);

      // The admin email was already delivered,
      // therefore the contact request itself succeeded.
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return {
      success: true,
      message: "Message sent successfully.",
    };
  } catch (error) {
    console.error("Contact form: unexpected error while sending email.", error);

    return {
      success: false,
      message: "Unable to send your message. Please try again.",
    };
  }
}
