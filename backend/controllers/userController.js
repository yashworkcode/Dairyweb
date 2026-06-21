const User = require("../models/User");
const Order = require("../models/Order");
const buildGoogleMapLink = require("../utils/googleMaps");

/**
 * GET /api/users
 * Admin only. Returns all registered users.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/address
 * Authenticated user. Saves a new delivery address with an auto-generated Google Maps link.
 * body: { label, fullAddress, isDefault }
 */
const addAddress = async (req, res, next) => {
  try {
    const { label, fullAddress, isDefault } = req.body;

    if (!fullAddress) {
      return res.status(400).json({ success: false, message: "fullAddress is required" });
    }

    const googleMapLink = buildGoogleMapLink(fullAddress);
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({ label, fullAddress, googleMapLink, isDefault: !!isDefault });
    await user.save();

    res.status(201).json({ success: true, message: "Address saved", addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/address/:addressId
 * Authenticated user.
 */
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, message: "Address removed", addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/admin/analytics
 * Admin only. Lightweight dashboard stats: totals + revenue + order status breakdown.
 */
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, revenueAgg, statusBreakdown] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const breakdown = statusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalOrders,
        totalRevenue,
        statusBreakdown: breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, addAddress, deleteAddress, getAdminAnalytics };
