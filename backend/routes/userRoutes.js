const express = require("express");
const { getAllUsers, addAddress, deleteAddress, getAdminAnalytics } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.get("/admin/analytics", protect, adminOnly, getAdminAnalytics);
router.post("/address", protect, addAddress);
router.delete("/address/:addressId", protect, deleteAddress);

module.exports = router;
