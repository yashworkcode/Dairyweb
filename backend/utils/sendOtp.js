const nodemailer = require("nodemailer");

/**
 * Generates a random 6-digit numeric OTP.
 */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

let mailTransporter = null;

const getMailTransporter = () => {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (!host || !user || !pass) {
    return null; // fallback to console in dev
  }

  mailTransporter = nodemailer.createTransport({
    host,
    port,
    // port 465 = SSL, everything else uses STARTTLS
    secure: port === 465,
    auth: { user, pass },
    tls: {
      // Allows self-signed certs on local/staging mail servers.
      // Set SMTP_REJECT_UNAUTHORIZED=true in production if your host requires it.
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === "true",
    },
  });

  return mailTransporter;
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

/**
 * Sends an OTP code via email.
 * Falls back to console.log when SMTP env vars are not set (dev-friendly).
 */
const sendOtpEmail = async (email, code, purpose = "signup") => {
  const transporter = getMailTransporter();
  const copy = OTP_COPY[purpose] || OTP_COPY.signup;
  const from =
    process.env.SMTP_FROM || "Vaishnavi Milk Dairy <no-reply@vaishnavimilkdairy.com>";

  if (!transporter) {
    // Dev fallback — OTP is visible in server logs
    console.log(
      `\n[DEV OTP] ──────────────────────────────\n  Purpose : ${purpose}\n  Email   : ${email}\n  Code    : ${code}\n────────────────────────────────────────\n`
    );
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: copy.subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
          <h2 style="color:#1d4ed8;margin-top:0;">${copy.heading}</h2>
          <p style="color:#374151;">${copy.intro}</p>
          <div style="background:#f3f4f6;padding:16px;text-align:center;border-radius:6px;margin:20px 0;">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;">${code}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;">This code expires in <strong>5 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[OTP] Sent ${purpose} OTP to ${email}`);
  } catch (err) {
    // Re-throw so the controller can return a proper 500 to the client
    console.error(`[OTP] Failed to send email to ${email}:`, err.message);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

module.exports = { generateOtpCode, sendOtpEmail };
