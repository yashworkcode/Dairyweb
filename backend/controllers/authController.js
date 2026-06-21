const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const { generateOtpCode, sendOtpEmail } = require("../utils/sendOtp");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Builds a public-safe user object for API responses.
 * Never include the password hash, even though the User model's
 * toJSON transform already strips it as a second line of defense.
 */
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

/**
 * Turns an email's local part into a unique, valid username.
 * Used to auto-provision a username for Google sign-ins, which don't
 * collect one from the person directly.
 */
const generateUniqueUsername = async (baseSeed) => {
  const base =
    baseSeed
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "user";

  let candidate = base;
  let suffix = 0;

  // Keep trying until we find a username that isn't taken yet.
  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
};

/**
 * POST /api/auth/send-otp
 * body: { identifier: string, channel: "email" }
 * Generates a 6 digit OTP for email verification and dispatches it.
 * Used during signup only (Email OTP verification), never for login.
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    const code = generateOtpCode();

    // Replace any previous unused OTP for this email.
    await Otp.deleteMany({ identifier: email, channel: "email" });
    await Otp.create({ identifier: email, channel: "email", code });

    await sendOtpEmail(email, code);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/register
 * body: { name, username, email, password, otp }
 * Verifies the email OTP, hashes the password, and creates the account.
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
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    if (otpRecord.attempts >= 5) {
      await otpRecord.deleteOne();
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    if (otpRecord.code !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
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

    // OTP is valid and consumed - delete it only after the account is created.
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

/**
 * POST /api/auth/login
 * body: { identifier, password } - identifier is username OR email.
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
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
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

/**
 * POST /api/auth/google-login
 * body: { idToken }
 * Verifies the Google ID token (issued by Google Identity Services on the
 * frontend) and logs the user in, auto-creating an account on first sign-in.
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

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (requires `protect` middleware).
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  sendOtp,
  register,
  login,
  googleLogin,
  getMe,
};
