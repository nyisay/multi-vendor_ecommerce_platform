const express = require("express");
const router = express.Router();

const { createOrder, getMyOrders } = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Customer only
router.post("/", protect, authorizeRoles("customer"), createOrder);
router.get("/", protect, authorizeRoles("customer"), getMyOrders);

module.exports = router;