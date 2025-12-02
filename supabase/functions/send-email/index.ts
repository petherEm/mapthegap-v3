import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const adminEmail = Deno.env.get("ADMIN_EMAIL") as string;
const fromEmail = Deno.env.get("FROM_EMAIL") || "MapTheGap <welcome@mapthegap.io>";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://hqxueienjtkxpyvsnqpf.supabase.co";

// Parse the hook secret - the Webhook class expects "whsec_" + base64 secret
const rawSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;
let hookSecret = rawSecret;
// Remove only the "v1," prefix, keep "whsec_"
if (hookSecret?.startsWith("v1,")) {
  hookSecret = hookSecret.substring(3);
}
// If no whsec_ prefix, add it
if (!hookSecret?.startsWith("whsec_")) {
  hookSecret = "whsec_" + hookSecret;
}
console.log("Using hook secret with whsec prefix, length:", hookSecret?.length);

interface WebhookPayload {
  user: {
    email: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

// Email content based on action type
function getEmailContent(type: string) {
  const content: Record<string, { preview: string; heading: string; intro: string; cta: string; buttonText: string }> = {
    signup: {
      preview: "Welcome to MapTheGap - Confirm your email to get started",
      heading: "Welcome to MapTheGap!",
      intro: "Thanks for signing up! You're one step away from exploring location data across 8+ countries and multiple industries.",
      cta: "Click the button below to confirm your email address:",
      buttonText: "Confirm Email Address",
    },
    magiclink: {
      preview: "Your MapTheGap login link",
      heading: "Your Login Link",
      intro: "You requested a magic link to sign in to your MapTheGap account.",
      cta: "Click the button below to sign in:",
      buttonText: "Sign In to MapTheGap",
    },
    recovery: {
      preview: "Reset your MapTheGap password",
      heading: "Reset Your Password",
      intro: "We received a request to reset your MapTheGap password.",
      cta: "Click the button below to choose a new password:",
      buttonText: "Reset Password",
    },
    invite: {
      preview: "You've been invited to MapTheGap",
      heading: "You're Invited!",
      intro: "Someone has invited you to join MapTheGap, the location intelligence platform.",
      cta: "Click the button below to accept your invitation:",
      buttonText: "Accept Invitation",
    },
    email_change: {
      preview: "Confirm your new email address",
      heading: "Confirm Email Change",
      intro: "You requested to change the email address associated with your MapTheGap account.",
      cta: "Click the button below to confirm your new email:",
      buttonText: "Confirm New Email",
    },
  };

  return content[type] || {
    preview: "Action required for your MapTheGap account",
    heading: "Action Required",
    intro: "Please complete the following action for your MapTheGap account.",
    cta: "Click the button below to continue:",
    buttonText: "Continue",
  };
}

// Generate HTML email template
function generateEmailHtml(
  confirmationUrl: string,
  token: string,
  emailActionType: string
): string {
  const content = getEmailContent(emailActionType);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.preview}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 48px 24px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width: 560px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="font-size: 28px; font-weight: bold; color: #8b5cf6; letter-spacing: -0.5px;">MapTheGap</span>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #fafafa; letter-spacing: -0.5px;">${content.heading}</h1>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 16px; line-height: 26px; color: #d4d4d4;">${content.intro}</p>
            </td>
          </tr>

          <!-- CTA Text -->
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; line-height: 26px; color: #d4d4d4;">${content.cta}</p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${confirmationUrl}" target="_blank" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px;">${content.buttonText}</a>
            </td>
          </tr>

          <!-- Token -->
          ${token ? `
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 16px; line-height: 26px; color: #d4d4d4;">
                Or use this confirmation code:
                <code style="display: inline-block; background-color: #262626; border-radius: 6px; color: #fafafa; font-size: 18px; font-weight: 600; padding: 6px 12px; letter-spacing: 1px;">${token}</code>
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Expiry Notice -->
          <tr>
            <td>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #737373;">
                This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 32px 0 24px;">
              <hr style="border: none; border-top: 1px solid #262626; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="margin: 0 0 8px; font-size: 14px; line-height: 20px; color: #a3a3a3;">
                <a href="https://www.mapthegap.io" target="_blank" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">MapTheGap</a> - Location Intelligence Platform
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #525252;">
                Mapping networks across 8+ countries and multiple industries
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  try {
    // Verify webhook signature and parse payload
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as WebhookPayload;

    console.log(`Processing ${email_action_type} email for ${user.email}`);

    // Build confirmation URL
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    // Generate HTML using inline template (fast, no React rendering)
    const html = generateEmailHtml(confirmationUrl, token, email_action_type);

    // Determine subject based on email action type
    const subjects: Record<string, string> = {
      signup: "Welcome to MapTheGap - Confirm Your Email",
      magiclink: "Your MapTheGap Login Link",
      recovery: "Reset Your MapTheGap Password",
      invite: "You've Been Invited to MapTheGap",
      email_change: "Confirm Your New Email Address",
    };
    const subject = subjects[email_action_type] || "MapTheGap - Action Required";

    // Send email to user
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send user email:", error);
      throw error;
    }

    console.log(`Successfully sent ${email_action_type} email to ${user.email}`);

    // Send admin notification (non-blocking, only for signups)
    if (adminEmail && email_action_type === "signup") {
      resend.emails
        .send({
          from: fromEmail,
          to: [adminEmail],
          subject: `🎉 New signup: ${user.email}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #0a0a0a; color: #fafafa; border-radius: 8px;">
              <h2 style="color: #8b5cf6; margin: 0 0 20px; font-size: 20px;">New User Registration</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #a3a3a3; width: 80px;">Email:</td>
                  <td style="padding: 8px 0; color: #fafafa; font-weight: 500;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a3a3a3;">Time:</td>
                  <td style="padding: 8px 0; color: #fafafa;">${new Date().toISOString()}</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;" />
              <p style="color: #737373; font-size: 13px; margin: 0;">MapTheGap Admin Notification</p>
            </div>
          `,
        })
        .then(() => console.log(`Admin notification sent to ${adminEmail}`))
        .catch((err: Error) => console.error("Admin notification failed:", err));
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook verification failed!");
    console.error("Error:", error);
    console.error("Error message:", (error as Error).message);
    return new Response(
      JSON.stringify({
        error: {
          http_code: (error as { code?: number }).code || 500,
          message: (error as Error).message,
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
