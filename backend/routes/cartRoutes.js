const express = require("express");
const router = express.Router();

const { getCart, addToCart } = require("../controllers/cartController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Only customers
router.get("/", protect, authorizeRoles("customer"), getCart);
router.post("/", protect, authorizeRoles("customer"), addToCart);

module.exports = router;