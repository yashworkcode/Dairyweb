const express = require("express");
const {
  sendOtp,
  register,
  login,
  googleLogin,
  sendLoginOtp,
  verifyLoginOtp,
  sendResetOtp,
  resetPassword,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/login-otp/send", sendLoginOtp);
router.post("/login-otp/verify", verifyLoginOtp);
router.post("/forgot-password/send", sendResetOtp);
router.post("/forgot-password/reset", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;