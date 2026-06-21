const Order = require("../models/Order");
const Product = require("../models/Product");
const buildGoogleMapLink = require("../utils/googleMaps");

/**
 * POST /api/orders
 * Authenticated user. Creates an order from cart items + delivery details.
 * body: {
 *   items: [{ productId, quantity }],
 *   fullName, phone, email, address,
 *   subscriptionType, paymentMethod
 * }
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, fullName, phone, email, address, subscriptionType, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Order must contain at least one product" });
    }
    if (!fullName || !phone || !address) {
      return res.status(400).json({ success: false, message: "fullName, phone and address are required" });
    }

    // Re-fetch product data server-side so prices can never be spoofed by the client.
    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const orderItems = items.map((item) => {
      const product = dbProducts.find((p) => p._id.toString() === item.productId);
      if (!product) {
        throw Object.assign(new Error(`Product ${item.productId} not found`), { statusCode: 400 });
      }
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      };
    });

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const googleMapLink = buildGoogleMapLink(address);

    const order = await Order.create({
      userId: req.user._id,
      products: orderItems,
      totalPrice,
      fullName,
      phone,
      email,
      address,
      googleMapLink,
      subscriptionType: subscriptionType || "None",
      subscriptionActive: !!subscriptionType && subscriptionType !== "None",
      paymentMethod: paymentMethod || "COD",
    });

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/user
 * Authenticated user. Returns the logged-in user's order history.
 */
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/admin
 * Admin only. Returns all orders, optionally filtered by ?status=
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    const orders = await Order.find(filter).populate("userId", "name email username").sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/status/:id
 * Admin only. body: { status: "Pending" | "Processing" | "Delivered" | "Cancelled" }
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Authenticated user (own order) or admin (any order). Used for order tracking detail view.
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = order.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getUserOrders, getAllOrders, updateOrderStatus, getOrderById };
