const Category = require("../models/Category");

// Create Category (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // check if exists
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name });

    res.status(201).json(category);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCategory };