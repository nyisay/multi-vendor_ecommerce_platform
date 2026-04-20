const express = require("express");
const router = express.Router();

const { createCategory, getCategories } = require("../controllers/categoryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getCategories);

// Only admin can create category
router.post("/", protect, authorizeRoles("admin"), createCategory);

module.exports = router;