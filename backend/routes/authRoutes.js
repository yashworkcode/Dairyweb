const express = require("express");
const {
  sendOtp,
  register,
  login,
  googleLogin,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/me", protect, getMe);

module.exports = router;