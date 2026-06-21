const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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

const sendOtpEmail = async (email, code, purpose = "signup") => {
  const copy = OTP_COPY[purpose] || OTP_COPY.signup;

  try {
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: copy.subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
          <h2 style="color:#1d4ed8;margin-top:0;">${copy.heading}</h2>
          <p style="color:#374151;">${copy.intro}</p>

          <div style="background:#f3f4f6;padding:16px;text-align:center;border-radius:6px;margin:20px 0;">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;">
              ${code}
            </span>
          </div>

          <p style="color:#6b7280;font-size:13px;">
            This code expires in <strong>5 minutes</strong>.
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[RESEND ERROR]", error);
      throw new Error(error.message);
    }

    console.log(`[OTP] Sent ${purpose} OTP to ${email}`);
  } catch (err) {
    console.error(`[OTP] Failed to send email to ${email}:`, err);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

module.exports = {
  generateOtpCode,
  sendOtpEmail,
};