const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // calculate total price
    let totalPrice = 0;

    cart.items.forEach(item => {
      totalPrice += item.productId.price * item.quantity;
    });

    const order = await Order.create({
      userId: req.user.id,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity
      })),
      totalPrice
    });

    // 🔥 Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId", "name price");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders };