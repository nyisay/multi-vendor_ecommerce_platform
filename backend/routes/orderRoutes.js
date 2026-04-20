const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  cancelMyOrder,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorSalesSummary,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAdminDashboardAnalytics
} = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Customer only
router.post("/", protect, authorizeRoles("customer"), createOrder);
router.get("/", protect, authorizeRoles("customer"), getMyOrders);
router.put("/:id/cancel", protect, authorizeRoles("customer"), cancelMyOrder);

// Vendor endpoints
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorOrders);
router.put("/vendor/:id/status", protect, authorizeRoles("vendor"), updateVendorOrderStatus);
router.get("/vendor/stats", protect, authorizeRoles("vendor"), getVendorSalesSummary);

// Admin endpoints
router.get("/admin/all", protect, authorizeRoles("admin"), getAllOrdersAdmin);
router.put("/admin/:id/status", protect, authorizeRoles("admin"), updateOrderStatusAdmin);
router.get("/admin/analytics", protect, authorizeRoles("admin"), getAdminDashboardAnalytics);

module.exports = router;