const Product = require("../models/Product");

/**
 * GET /api/products
 * Public. Supports optional ?category= filter and ?search= text filter.
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== "All") {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Public.
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products
 * Admin only.
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, unit, category, image, stock, isSubscriptionEligible } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ success: false, message: "name, price and category are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      unit,
      category,
      image,
      stock,
      isSubscriptionEligible,
    });

    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Admin only. Used for editing details and/or price.
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const allowedFields = ["name", "description", "price", "unit", "category", "image", "stock", "isSubscriptionEligible", "isActive"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.json({ success: true, message: "Product updated", product });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Admin only.
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
