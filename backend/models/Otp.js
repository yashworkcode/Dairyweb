const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, lowercase: true, trim: true }, // email address
    channel: { type: String, enum: ["email"], default: "email", required: true },
    code: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete after 5 min
  },
  { timestamps: false }
);

otpSchema.index({ identifier: 1, channel: 1 });

module.exports = mongoose.model("Otp", otpSchema);
