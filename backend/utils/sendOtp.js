const nodemailer = require("nodemailer");

/**
 * Generates a random 6 digit numeric OTP.
 */
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

let mailTransporter = null;
const getMailTransporter = () => {
  if (mailTransporter) return mailTransporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return mailTransporter;
};

/**
 * Sends an OTP code via email. Falls back to console logging when SMTP is not
 * configured, which keeps local development frictionless.
 */
const sendOtpEmail = async (email, code) => {
  const transporter = getMailTransporter();

  if (!transporter) {
    console.log(`[DEV OTP] Email OTP for ${email}: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Vaishnavi Milk Dairy <no-reply@vaishnavimilkdairy.com>",
    to: email,
    subject: "Your Vaishnavi Milk Dairy verification code",
    html: `<p>Your one-time verification code is:</p><h2>${code}</h2><p>This code expires in 5 minutes.</p>`,
  });
};

module.exports = { generateOtpCode, sendOtpEmail };
