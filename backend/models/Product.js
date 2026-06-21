const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "1 unit" }, // e.g. "500 ml", "1 L", "250 g"
    category: {
      type: String,
      required: true,
      enum: ["Milk", "Curd", "Paneer", "Ghee", "Butter", "Cheese", "Other"],
      default: "Other",
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600",
    },
    stock: { type: Number, default: 100 },
    isSubscriptionEligible: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
