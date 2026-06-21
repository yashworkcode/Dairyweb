require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");

const sampleProducts = [
  {
    name: "Fresh Cow Milk",
    description: "Farm-fresh, pasteurized full-cream cow milk delivered chilled.",
    price: 32,
    unit: "500 ml",
    category: "Milk",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600",
  },
  {
    name: "Toned Milk",
    description: "Lighter, low-fat toned milk - great for everyday tea and coffee.",
    price: 28,
    unit: "500 ml",
    category: "Milk",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600",
  },
  {
    name: "Fresh Curd",
    description: "Thick, creamy curd set the traditional way.",
    price: 40,
    unit: "400 g",
    category: "Curd",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
  },
  {
    name: "Paneer Block",
    description: "Soft, fresh paneer cut straight from the block.",
    price: 90,
    unit: "200 g",
    category: "Paneer",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600",
  },
  {
    name: "Pure Desi Ghee",
    description: "Slow-cooked, aromatic clarified butter made from cow milk.",
    price: 550,
    unit: "500 ml",
    category: "Ghee",
    image: "https://images.unsplash.com/photo-1631206753348-db44968fd440?w=600",
    isSubscriptionEligible: false,
  },
  {
    name: "White Butter",
    description: "Unsalted, hand-churned white butter.",
    price: 120,
    unit: "200 g",
    category: "Butter",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600",
    isSubscriptionEligible: false,
  },
];

const runSeed = async () => {
  try {
    await connectDB();

    // ----- Admin user -----
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@vaishnavimilkdairy.com").toLowerCase();
    const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe@123";

    let admin = await User.findOne({ $or: [{ email: adminEmail }, { username: adminUsername }] });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        authProvider: "password",
        isVerified: true,
      });
      console.log(`Admin user created -> username: ${admin.username} | email: ${admin.email}`);
      if (!process.env.ADMIN_PASSWORD) {
        console.log(`Using default admin password "${adminPassword}" - set ADMIN_PASSWORD in .env and re-seed to change it.`);
      }
    } else {
      console.log(`Admin user already exists: ${admin.username} (${admin.email})`);
    }

    // ----- Sample products -----
    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`Inserted ${sampleProducts.length} sample products`);
    } else {
      console.log(`Products already exist (${existingCount}), skipping product seed`);
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runSeed();
