const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const { generateOtpCode, sendOtpEmail } = require("../utils/sendOtp");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/** Builds a public-safe user object — never exposes the password hash. */
const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
  avatar: user.avatar,
  isVerified: user.isVerified,
});

/** Turns an email local-part into a unique, collision-free username. */
const generateUniqueUsername = async (baseSeed) => {
  const base =
    baseSeed
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "user";

  let candidate = base;
  let suffix = 0;
  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
};

/**
 * Shared OTP verification helper.
 * Returns { ok: true } or { ok: false, status, message }.
 * Mutates otpRecord (increments attempts) and saves on failure.
 */
const verifyOtpRecord = async (otpRecord, submittedCode) => {
  if (!otpRecord) {
    return { ok: false, status: 400, message: "OTP expired or not found. Please request a new one." };
  }

  if (otpRecord.attempts >= 5) {
    await otpRecord.deleteOne();
    return { ok: false, status: 429, message: "Too many incorrect attempts. Please request a new OTP." };
  }

  // Normalise to string so numeric OTPs from the frontend still match
  if (String(otpRecord.code) !== String(submittedCode).trim()) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = 5 - otpRecord.attempts;
    return {
      ok: false,
      status: 400,
      message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  return { ok: true };
};

// ─── Signup OTP ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 * body: { identifier: string, channel: "email" }
 * Sends a verification OTP for new account registration.
 */
const sendOtp = async (req, res, next) => {
  try {
    const { identifier, channel } = req.body;

    if (!identifier || channel !== "email") {
      return res.status(400).json({
        success: false,
        message: "A valid email and channel: 'email' are required",
      });
    }

    const email = identifier.toLowerCase().trim();

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    // Enforce a 60-second cooldown between resend requests
    const recent = await Otp.findOne({
      identifier: email,
      channel: "email",
      purpose: "signup",
    }).sort({ createdAt: -1 });

    if (recent) {
      const secondsAgo = (Date.now() - new Date(recent.createdAt).getTime()) / 1000;
      if (secondsAgo < 60) {
        const wait = Math.ceil(60 - secondsAgo);
        return res.status(429).json({
          success: false,
          message: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting a new OTP.`,
        });
      }
    }

    const code = generateOtpCode();
    await Otp.deleteMany({ identifier: email, channel: "email", purpose: "signup" });
    await Otp.create({ identifier: email, channel: "email", purpose: "signup", code });
    await sendOtpEmail(email, code, "signup");

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    next(error);
  }
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * body: { name, username, email, password, otp }
 */
const register = async (req, res, next) => {
  try {
    const { username, name, email, password, otp } = req.body;

    if (!username || !name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email, password and OTP are all required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      identifier: normalizedEmail,
      channel: "email",
      purpose: "signup",
    }).sort({ createdAt: -1 });

    const check = await verifyOtpRecord(otpRecord, otp);
    if (!check.ok) {
      return res.status(check.status).json({ success: false, message: check.message });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "An account with this email already exists."
            : "This username is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "password",
      isVerified: true,
    });

    await otpRecord.deleteOne();

    res.status(201).json({
      success: true,
      message: "Account created successfully. You can now log in.",
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Password Login ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * body: { identifier, password } — identifier is email OR username.
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    });

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/google-login
 * body: { idToken }
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

    if (!user) {
      const username = await generateUniqueUsername(normalizedEmail.split("@")[0]);
      user = await User.create({
        name,
        username,
        email: normalizedEmail,
        googleId,
        avatar: picture,
        authProvider: "google",
        isVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.isVerified = true;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Google login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login OTP ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login-otp/send
 * body: { email }
 */
const sendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return 200 to avoid leaking whether an account exists
      return res.json({
        success: true,
        message: "If an account exists with this email, a login code has been sent.",
      });
    }

    // 60-second cooldown between resend requests
    const recent = await Otp.findOne({
      identifier: normalizedEmail,
      channel: "email",
      purpose: "login",
    }).sort({ createdAt: -1 });

    if (recent) {
      const secondsAgo = (Date.now() - new Date(recent.createdAt).getTime()) / 1000;
      if (secondsAgo < 60) {
        const wait = Math.ceil(60 - secondsAgo);
        return res.status(429).json({
          success: false,
          message: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting a new code.`,
        });
      }
    }

    const code = generateOtpCode();
    await Otp.deleteMany({ identifier: normalizedEmail, channel: "email", purpose: "login" });
    await Otp.create({ identifier: normalizedEmail, channel: "email", purpose: "login", code });
    await sendOtpEmail(normalizedEmail, code, "login");

    res.json({ success: true, message: "Login code sent to your email" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login-otp/verify
 * body: { email, otp }
 */
const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      identifier: normalizedEmail,
      channel: "email",
      purpose: "login",
    }).sort({ createdAt: -1 });

    const check = await verifyOtpRecord(otpRecord, otp);
    if (!check.ok) {
      return res.status(check.status).json({ success: false, message: check.message });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "Account no longer exists" });
    }

    await otpRecord.deleteOne();

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password/send
 * body: { email }
 */
const sendResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return 200 to avoid leaking whether an account exists
      return res.json({
        success: true,
        message: "If an account exists with this email, a reset code has been sent.",
      });
    }

    // 60-second cooldown between resend requests
    const recent = await Otp.findOne({
      identifier: normalizedEmail,
      channel: "email",
      purpose: "reset",
    }).sort({ createdAt: -1 });

    if (recent) {
      const secondsAgo = (Date.now() - new Date(recent.createdAt).getTime()) / 1000;
      if (secondsAgo < 60) {
        const wait = Math.ceil(60 - secondsAgo);
        return res.status(429).json({
          success: false,
          message: `Please wait ${wait} second${wait === 1 ? "" : "s"} before requesting a new code.`,
        });
      }
    }

    const code = generateOtpCode();
    await Otp.deleteMany({ identifier: normalizedEmail, channel: "email", purpose: "reset" });
    await Otp.create({ identifier: normalizedEmail, channel: "email", purpose: "reset", code });
    await sendOtpEmail(normalizedEmail, code, "reset");

    res.json({ success: true, message: "Reset code sent to your email" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password/reset
 * body: { email, otp, newPassword }
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are all required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      identifier: normalizedEmail,
      channel: "email",
      purpose: "reset",
    }).sort({ createdAt: -1 });

    const check = await verifyOtpRecord(otpRecord, otp);
    if (!check.ok) {
      return res.status(check.status).json({ success: false, message: check.message });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "Account no longer exists" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await otpRecord.deleteOne();

    res.json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};

// ─── Me ───────────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Requires `protect` middleware.
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  sendOtp,
  register,
  login,
  googleLogin,
  sendLoginOtp,
  verifyLoginOtp,
  sendResetOtp,
  resetPassword,
  getMe,
};
