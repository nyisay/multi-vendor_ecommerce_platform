const Product = require("../models/Product");
const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");

const PRODUCT_DETAIL_POPULATE = [
  { path: "vendorId", select: "name email" },
  { path: "categoryId", select: "name" },
  { path: "reviews.userId", select: "name profileImageUrl" }
];

const getFilePathFromImageUrl = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return null;
  return path.join(__dirname, "..", imageUrl);
};

const removeProductImageFile = (imageUrl) => {
  const filePath = getFilePathFromImageUrl(imageUrl);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const buildProductDetailQuery = (productId) => Product.findById(productId)
  .populate(PRODUCT_DETAIL_POPULATE);

const calculateAverageRating = (reviews) => {
  if (!reviews.length) {
    return 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return totalRating / reviews.length;
};

const normalizeReviewComment = (comment) => {
  if (typeof comment !== "string") {
    return "";
  }

  return comment.trim();
};

const isSameId = (left, right) => String(left) === String(right);

// Create Product (Vendor only)
const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (req.user.role === "vendor" && req.user.vendorStatus !== "approved") {
      return res.status(403).json({ message: "Vendor account is not approved" });
    }

    const product = await Product.create({
      name,
      price,
      description,
      stock,
      categoryId,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      vendorId: req.user._id //from JWT
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all products
const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      q,
      sortBy = "newest",
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    if (category) {
      filter.categoryId = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 }
    };

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("vendorId", "name")
      .populate("categoryId", "name")
      .sort(sortMap[sortBy] || sortMap.newest)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      items: products,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get respective vendors' product
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user._id })
      .populate("categoryId", "name");

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByVendor = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId })
      .populate("categoryId", "name")
      .populate("vendorId", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await buildProductDetailQuery(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//update
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId, removeImage } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //Check ownership
    if (req.user.role !== "admin" && product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    // Update fields
    product.name = name || product.name;
    product.price = price ?? product.price;
    product.description = description || product.description;
    product.stock = stock ?? product.stock;
    product.categoryId = categoryId || product.categoryId;
    if (removeImage === "true" || removeImage === true) {
      removeProductImageFile(product.imageUrl);
      product.imageUrl = undefined;
    }

    if (req.file) {
      removeProductImageFile(product.imageUrl);
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

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
    if (req.user.role !== "admin" && product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    removeProductImageFile(product.imageUrl);
    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ratingValue = Number(rating);

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === req.user._id.toString()
    );
    const nextComment = normalizeReviewComment(comment);

    if (existingReview) {
      existingReview.rating = ratingValue;
      existingReview.comment = nextComment;
    } else {
      product.reviews.push({
        userId: req.user._id,
        rating: ratingValue,
        comment: nextComment
      });
    }

    product.averageRating = calculateAverageRating(product.reviews);

    await product.save();
    const hydratedProduct = await buildProductDetailQuery(product._id);

    res.json({
      message: existingReview ? "Review updated" : "Review added",
      averageRating: product.averageRating,
      product: hydratedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reactToProductReview = async (req, res) => {
  try {
    const { reaction } = req.body;

    if (!["like", "dislike"].includes(reaction)) {
      return res.status(400).json({ message: "Reaction must be like or dislike" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (isSameId(review.userId, req.user._id)) {
      return res.status(400).json({ message: "You cannot react to your own review" });
    }

    const likeIndex = review.likes.findIndex((userId) => isSameId(userId, req.user._id));
    const dislikeIndex = review.dislikes.findIndex((userId) => isSameId(userId, req.user._id));

    if (reaction === "like") {
      if (likeIndex >= 0) {
        review.likes.splice(likeIndex, 1);
      } else {
        if (dislikeIndex >= 0) {
          review.dislikes.splice(dislikeIndex, 1);
        }
        review.likes.push(req.user._id);
      }
    }

    if (reaction === "dislike") {
      if (dislikeIndex >= 0) {
        review.dislikes.splice(dislikeIndex, 1);
      } else {
        if (likeIndex >= 0) {
          review.likes.splice(likeIndex, 1);
        }
        review.dislikes.push(req.user._id);
      }
    }

    await product.save();
    const hydratedProduct = await buildProductDetailQuery(product._id);

    res.json({
      message: "Reaction saved",
      product: hydratedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!isSameId(product.vendorId, req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete reviews for this product" });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    product.reviews.pull(review._id);
    product.averageRating = calculateAverageRating(product.reviews);

    await product.save();
    const hydratedProduct = await buildProductDetailQuery(product._id);

    res.json({
      message: "Review deleted",
      averageRating: product.averageRating,
      product: hydratedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendorId", "name email")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
