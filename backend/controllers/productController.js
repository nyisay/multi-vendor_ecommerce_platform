const Product = require("../models/Product");

// Create Product (Vendor only)
const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId } = req.body;

    const product = await Product.create({
      name,
      price,
      description,
      stock,
      categoryId,
      vendorId: req.user.id //from JWT
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all products
const getProducts = async (req, res) => {
  try {
    let filter = {};

    if (req.query.category) {
      filter.categoryId = req.query.category;
    }

    const products = await Product.find(filter)
      .populate("vendorId", "name")
      .populate("categoryId", "name");

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get respective vendors' product
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user.id })
      .populate("categoryId", "name");

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//update
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //Check ownership
    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    // Update fields
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.stock = stock || product.stock;
    product.categoryId = categoryId || product.categoryId;

    const updatedProduct = await product.save();

    res.json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//delete
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //Check ownership
    if (product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProduct, getProducts, getMyProducts, updateProduct, deleteProduct };