const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, lowercase: true, trim: true }, // email address
    channel: { type: String, enum: ["email"], default: "email", required: true },
    // What this code is for. Keeping signup / login / reset codes in separate
    // buckets means a signup OTP can never be replayed to log in, etc.
    purpose: { type: String, enum: ["signup", "login", "reset"], default: "signup", required: true },
    code: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete after 5 min
  },
  { timestamps: false }
);

otpSchema.index({ identifier: 1, channel: 1, purpose: 1 });

module.exports = mongoose.model("Otp", otpSchema);
