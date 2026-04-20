const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId._id}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      totalPrice += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        vendorId: product.vendorId
      });
    }

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalPrice,
      status: "pending",
      paymentStatus: "unpaid"
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.productId", "name price");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!["pending", "paid"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    order.status = "cancelled";
    order.cancelledBy = "customer";

    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.vendorId": req.user._id })
      .populate("userId", "name email")
      .populate("items.productId", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVendorOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid vendor status update" });
    }

    const order = await Order.findOne({ _id: req.params.id, "items.vendorId": req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found for this vendor" });
    }

    order.status = status;
    if (status === "cancelled") {
      order.cancelledBy = "vendor";
    }

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorSalesSummary = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
      { $unwind: "$items" },
      { $match: { "items.vendorId": req.user._id } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] } },
          totalItemsSold: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.json(sales[0] || { totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid order status" });
      }
      order.status = status;
      if (status === "cancelled") {
        order.cancelledBy = "admin";
      }
    }

    if (paymentStatus) {
      const validPaymentStatuses = ["unpaid", "paid", "failed", "refunded"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: "Invalid payment status" });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    res.json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminDashboardAnalytics = async (req, res) => {
  try {
    const [totalOrders, totalRevenueData, totalUsers, totalProducts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" } } }
      ]),
      require("../models/User").countDocuments(),
      Product.countDocuments()
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenueData[0]?.revenue || 0,
      totalUsers,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  cancelMyOrder,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorSalesSummary,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAdminDashboardAnalytics
};