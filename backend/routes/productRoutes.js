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

// Public route
router.get("/", getProducts);
router.get("/vendor/:vendorId", getProductsByVendor);

// Vendor only
router.get("/my-products", protect, authorizeRoles("vendor"), getMyProducts);

// Create product (vendor only)
router.post("/", protect, authorizeRoles("vendor"), uploadProductImage.single("image"), createProduct);

// Update product (vendor only)
router.put("/:id", protect, authorizeRoles("vendor"), uploadProductImage.single("image"), updateProduct);

// Delete product (vendor only)
router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);

// Admin product management
router.get("/admin/all", protect, authorizeRoles("admin"), getAllProductsAdmin);
router.put("/admin/:id", protect, authorizeRoles("admin"), uploadProductImage.single("image"), updateProduct);
router.delete("/admin/:id", protect, authorizeRoles("admin"), deleteProduct);

router.get("/:id", getProductById);
router.post("/:id/reviews", protect, authorizeRoles("customer"), addProductReview);

module.exports = router;