const express = require("express");
const router = express.Router();

const { createProduct, getProducts, getMyProducts } = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { updateProduct } = require("../controllers/productController");
const { deleteProduct } = require("../controllers/productController");

// Public route
router.get("/", getProducts);

// Vendor only
router.get("/my-products", protect, authorizeRoles("vendor"), getMyProducts);

// Create product (vendor only)
router.post("/", protect, authorizeRoles("vendor"), createProduct);

// Update product (vendor only)
router.put("/:id", protect, authorizeRoles("vendor"), updateProduct);

// Delete product (vendor only)
router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);

module.exports = router;