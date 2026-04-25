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
  reactToProductReview,
  deleteProductReview,
  getAllProductsAdmin
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadProductImages } = require("../middleware/uploadMiddleware");
const { requireObjectIdParam, validateCreateProduct } = require("../middleware/validationMiddleware");

const productGalleryUpload = uploadProductImages.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 4 }
]);

// Public route
router.get("/", getProducts);
router.get("/vendor/:vendorId", getProductsByVendor);

// Vendor only
router.get("/my-products", protect, authorizeRoles("vendor"), getMyProducts);

// Create product (vendor only)
router.post("/", protect, authorizeRoles("vendor"), productGalleryUpload, validateCreateProduct, createProduct);

// Update product (vendor only)
router.put("/:id", protect, authorizeRoles("vendor"), requireObjectIdParam("id"), productGalleryUpload, updateProduct);

// Delete product (vendor only)
router.delete("/:id", protect, authorizeRoles("vendor"), requireObjectIdParam("id"), deleteProduct);

// Admin product management
router.get("/admin/all", protect, authorizeRoles("admin"), getAllProductsAdmin);
router.put("/admin/:id", protect, authorizeRoles("admin"), requireObjectIdParam("id"), productGalleryUpload, updateProduct);
router.delete("/admin/:id", protect, authorizeRoles("admin"), requireObjectIdParam("id"), deleteProduct);

router.post("/:id/reviews", protect, authorizeRoles("customer"), requireObjectIdParam("id"), addProductReview);
router.post("/:id/reviews/:reviewId/reactions", protect, authorizeRoles("customer"), requireObjectIdParam("id"), requireObjectIdParam("reviewId"), reactToProductReview);
router.delete("/:id/reviews/:reviewId", protect, authorizeRoles("vendor"), requireObjectIdParam("id"), requireObjectIdParam("reviewId"), deleteProductReview);
router.get("/:id", requireObjectIdParam("id"), getProductById);

module.exports = router;
