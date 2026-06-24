const nodemailer = require("nodemailer");

/**
 * Generates a random 6-digit numeric OTP.
 */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verify Error:", error);
  } else {
    console.log("SMTP Server is ready");
  }
});

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
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: copy.subject,
      html: `
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
      `,
    });

    console.log(`[OTP] Sent ${purpose} OTP to ${email}`);
  } catch (err) {
    console.error("[SMTP ERROR]", err);
    throw new Error("Failed to send OTP email.");
  }
};

module.exports = {
  generateOtpCode,
  sendOtpEmail,
};