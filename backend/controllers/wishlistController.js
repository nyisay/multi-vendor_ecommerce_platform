const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const WISHLIST_POPULATE = {
  path: "products",
  populate: [
    { path: "vendorId", select: "name" },
    { path: "categoryId", select: "name" }
  ]
};

const isSameId = (left, right) => String(left) === String(right);

const getWishlistItems = async (userId) => {
  const wishlist = await Wishlist.findOne({ userId }).populate(WISHLIST_POPULATE);
  return wishlist?.products || [];
};

const getWishlist = async (req, res) => {
  try {
    const items = await getWishlistItems(req.user._id);
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    const alreadySaved = wishlist?.products?.some((productId) => isSameId(productId, product._id)) || false;

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user._id,
        products: [product._id]
      });
    } else {
      const existingProducts = wishlist.products.filter(
        (productId) => !isSameId(productId, product._id)
      );
      existingProducts.unshift(product._id);
      wishlist.products = existingProducts;
      await wishlist.save();
    }

    const items = await getWishlistItems(req.user._id);

    res.status(alreadySaved ? 200 : 201).json({
      message: alreadySaved ? "Wishlist updated" : "Added to wishlist",
      items
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.json({ message: "Wishlist updated", items: [] });
    }

    wishlist.products = wishlist.products.filter(
      (productId) => !isSameId(productId, req.params.productId)
    );
    await wishlist.save();

    const items = await getWishlistItems(req.user._id);

    res.json({
      message: "Removed from wishlist",
      items
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
