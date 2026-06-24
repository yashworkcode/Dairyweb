/**
 * OTP generation + delivery.
 *
 * IMPORTANT — why this uses Brevo's HTTP API instead of Gmail/Nodemailer SMTP:
 * This backend runs on Render's free tier. Since September 2025, Render's free
 * web services block ALL outbound traffic on SMTP ports 25, 465 and 587 —
 * https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports
 * That block happens at the network level, so Gmail SMTP (or any SMTP
 * provider) will time out / fail in production no matter how correct the
 * credentials are — even though it can work fine on your local machine.
 *
 * Brevo's Transactional Email API talks over plain HTTPS (port 443), which
 * Render does NOT block, so emails actually go out. Brevo's free plan gives
 * 300 emails/day at no cost, with no credit card required — see
 * https://www.brevo.com/free-email-api/
 *
 * Setup (one-time, ~5 minutes):
 *   1. Create a free account at https://www.brevo.com
 *   2. Go to Senders, Domains & Dedicated IPs -> Senders -> add & verify the
 *      email address you want OTPs to be sent FROM (a verification email is
 *      sent to that inbox — click the link in it). This must match
 *      BREVO_SENDER_EMAIL below.
 *   3. Go to your profile icon (top right) -> SMTP & API -> API Keys tab ->
 *      "Generate a new API key". Copy it into BREVO_API_KEY in backend/.env.
 *   4. Restart the server. Look for "[OTP]" lines in the logs to confirm.
 *
 * Local development without any Brevo account: leave BREVO_API_KEY empty in
 * backend/.env. The OTP will simply be printed to the server console instead
 * of emailed, so you can still test signup/login/reset flows end-to-end.
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Generates a random 6-digit numeric OTP.
 */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const OTP_COPY = {
  signup: {
    subject: "Your Vaishnavi Milk Dairy verification code",
    heading: "Email Verification",
    intro: "Use the code below to verify your email address:",
  },
  login: {
    subject: "Your Vaishnavi Milk Dairy login code",
    heading: "Login OTP",
    intro: "Use the code below to log in to your account:",
  },
  reset: {
    subject: "Your Vaishnavi Milk Dairy password reset code",
    heading: "Password Reset",
    intro: "Use the code below to reset your password:",
  },
};

/** Masks an email for safe logging, e.g. "jo***@gmail.com" */
const maskEmail = (email) => {
  const [local, domain] = String(email).split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
};

const buildHtml = (copy, code) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
    <h2>${copy.heading}</h2>
    <p>${copy.intro}</p>

    <div style="padding:20px;text-align:center;">
      <span style="font-size:36px;font-weight:bold;letter-spacing:6px;">
        ${code}
      </span>
    </div>

    <p>
      This OTP expires in 5 minutes.
    </p>
  </div>
`;

/**
 * Sends an OTP email via the Brevo HTTP API.
 * Falls back to console logging if BREVO_API_KEY is not configured, so local
 * development keeps working without any email provider set up.
 */
const sendOtpEmail = async (email, code, purpose = "signup") => {
  const copy = OTP_COPY[purpose] || OTP_COPY.signup;
  const timestamp = new Date().toISOString();
  const masked = maskEmail(email);

  // ----- Dev fallback: no API key configured -----
  if (!process.env.BREVO_API_KEY) {
    console.log(
      `[OTP] ${timestamp} | No BREVO_API_KEY set — printing OTP instead of emailing it.`
    );
    console.log(`[OTP] ${timestamp} | purpose=${purpose} to=${masked} code=${code}`);
    return { delivered: false, mode: "console" };
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    console.error(
      `[OTP] ${timestamp} | BREVO_API_KEY is set but BREVO_SENDER_EMAIL is missing. ` +
        `Add the verified sender address to backend/.env.`
    );
    throw new Error("Email sender is not configured. Please contact support.");
  }

  const payload = {
    sender: {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME || "Vaishnavi Milk Dairy",
    },
    to: [{ email }],
    subject: copy.subject,
    htmlContent: buildHtml(copy, code),
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        `[OTP] ${timestamp} | Brevo API error (status ${response.status}) for purpose=${purpose} to=${masked}:`,
        responseBody
      );
      throw new Error(
        responseBody?.message || "Failed to send OTP email. Please try again."
      );
    }

    console.log(
      `[OTP] ${timestamp} | Sent ${purpose} OTP to ${masked} (messageId=${responseBody.messageId || "n/a"})`
    );
    return { delivered: true, mode: "brevo", messageId: responseBody.messageId };
  } catch (err) {
    console.error(`[OTP] ${timestamp} | Send failure for purpose=${purpose} to=${masked}:`, err.message);
    throw new Error("Failed to send OTP email. Please try again in a moment.");
  }
};

module.exports = {
  generateOtpCode,
  sendOtpEmail,
};
