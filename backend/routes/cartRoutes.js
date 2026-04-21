const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart
} = require("../controllers/cartController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { requireObjectIdParam, validateCartPayload } = require("../middleware/validationMiddleware");

// Only customers
router.get("/", protect, authorizeRoles("customer"), getCart);
router.post("/", protect, authorizeRoles("customer"), validateCartPayload, addToCart);
router.put("/:productId", protect, authorizeRoles("customer"), requireObjectIdParam("productId"), updateCartItemQuantity);
router.delete("/:productId", protect, authorizeRoles("customer"), requireObjectIdParam("productId"), removeFromCart);

module.exports = router;