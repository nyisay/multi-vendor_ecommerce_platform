const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getVendors,
  updateVendorStatus
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { requireObjectIdParam, validateRegister, validateLogin } = require("../middleware/validationMiddleware");
const { uploadProfileAssets } = require("../middleware/uploadMiddleware");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/profile", protect, getMyProfile);
router.put(
  "/profile",
  protect,
  uploadProfileAssets.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "profileCardBackground", maxCount: 1 },
  ]),
  updateMyProfile,
);

// Admin management
router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/vendors", protect, authorizeRoles("admin"), getVendors);
router.put("/vendors/:id/status", protect, authorizeRoles("admin"), requireObjectIdParam("id"), updateVendorStatus);


module.exports = router;