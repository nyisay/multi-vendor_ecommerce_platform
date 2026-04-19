const express = require("express");
const router = express.Router();

const { createCategory } = require("../controllers/categoryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Only admin can create category
router.post("/", protect, authorizeRoles("admin"), createCategory);

module.exports = router;