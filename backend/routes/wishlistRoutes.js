const express = require("express");

const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require("../controllers/wishlistController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { requireObjectIdParam } = require("../middleware/validationMiddleware");

router.get("/", protect, authorizeRoles("customer"), getWishlist);
router.post("/:productId", protect, authorizeRoles("customer"), requireObjectIdParam("productId"), addToWishlist);
router.delete("/:productId", protect, authorizeRoles("customer"), requireObjectIdParam("productId"), removeFromWishlist);

module.exports = router;
