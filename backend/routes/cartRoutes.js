const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart
} = require("../controllers/cartController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Only customers
router.get("/", protect, authorizeRoles("customer"), getCart);
router.post("/", protect, authorizeRoles("customer"), addToCart);
router.put("/:productId", protect, authorizeRoles("customer"), updateCartItemQuantity);
router.delete("/:productId", protect, authorizeRoles("customer"), removeFromCart);

module.exports = router;