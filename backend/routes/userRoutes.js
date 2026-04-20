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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

// Admin management
router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/vendors", protect, authorizeRoles("admin"), getVendors);
router.put("/vendors/:id/status", protect, authorizeRoles("admin"), updateVendorStatus);


module.exports = router;