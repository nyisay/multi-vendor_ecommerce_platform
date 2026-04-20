const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.productId", "name price");

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity || 1);

    if (qty <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: []
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // update quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // add new item
      cart.items.push({ productId, quantity: qty });
    }

    await cart.save();

    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);
    if (qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((cartItem) => cartItem.productId.toString() === req.params.productId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(req.params.productId);
    if (!product || product.stock < qty) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = qty;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const previousLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId);

    if (cart.items.length === previousLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();
    res.json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItemQuantity, removeFromCart };