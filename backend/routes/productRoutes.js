const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getMyProducts,
  getProductsByVendor,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  getAllProductsAdmin
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadProductImage } = require("../middleware/uploadMiddleware");
const { requireObjectIdParam, validateCreateProduct } = require("../middleware/validationMiddleware");

// Public route
router.get("/", getProducts);
router.get("/vendor/:vendorId", getProductsByVendor);

// Vendor only
router.get("/my-products", protect, authorizeRoles("vendor"), getMyProducts);

// Create product (vendor only)
router.post("/", protect, authorizeRoles("vendor"), uploadProductImage.single("image"), validateCreateProduct, createProduct);

// Update product (vendor only)
router.put("/:id", protect, authorizeRoles("vendor"), requireObjectIdParam("id"), uploadProductImage.single("image"), updateProduct);

// Delete product (vendor only)
router.delete("/:id", protect, authorizeRoles("vendor"), requireObjectIdParam("id"), deleteProduct);

// Admin product management
router.get("/admin/all", protect, authorizeRoles("admin"), getAllProductsAdmin);
router.put("/admin/:id", protect, authorizeRoles("admin"), requireObjectIdParam("id"), uploadProductImage.single("image"), updateProduct);
router.delete("/admin/:id", protect, authorizeRoles("admin"), requireObjectIdParam("id"), deleteProduct);

router.get("/:id", requireObjectIdParam("id"), getProductById);
router.post("/:id/reviews", protect, authorizeRoles("customer"), requireObjectIdParam("id"), addProductReview);

module.exports = router;