const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { AppError } = require("../middleware/errorHandler");

const SHIPPING_FEES = {
  standard: 6.99,
  express: 14.99,
};
const PAYMENT_METHODS = ["cod", "card", "bank_transfer"];
const DELIVERY_METHODS = Object.keys(SHIPPING_FEES);

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeShippingAddress = (input = {}) => ({
  fullName: normalizeText(input.fullName),
  phone: normalizeText(input.phone),
  addressLine1: normalizeText(input.addressLine1),
  addressLine2: normalizeText(input.addressLine2),
  city: normalizeText(input.city),
  state: normalizeText(input.state),
  postalCode: normalizeText(input.postalCode),
  country: normalizeText(input.country),
});

const getMissingShippingFields = (shippingAddress) => {
  const requiredFields = [
    ["fullName", "full name"],
    ["phone", "phone"],
    ["addressLine1", "address line 1"],
    ["city", "city"],
    ["state", "state"],
    ["postalCode", "postal code"],
    ["country", "country"],
  ];

  return requiredFields
    .filter(([key]) => !shippingAddress[key])
    .map(([, label]) => label);
};

const buildLegacyAddress = (shippingAddress) => ([
  shippingAddress.addressLine1,
  shippingAddress.addressLine2,
  shippingAddress.city,
  shippingAddress.state,
  shippingAddress.postalCode,
  shippingAddress.country,
]
  .filter(Boolean)
  .join(", "));

const createOrder = asyncHandler(async (req, res) => {
  const deliveryMethod = DELIVERY_METHODS.includes(req.body.deliveryMethod)
    ? req.body.deliveryMethod
    : "standard";
  const paymentMethod = PAYMENT_METHODS.includes(req.body.paymentMethod)
    ? req.body.paymentMethod
    : "cod";
  const shippingAddress = normalizeShippingAddress(req.body.shippingAddress);
  const orderNotes = normalizeText(req.body.orderNotes);
  const missingShippingFields = getMissingShippingFields(shippingAddress);

  if (missingShippingFields.length > 0) {
    throw new AppError(
      `Missing checkout details: ${missingShippingFields.join(", ")}`,
      400,
      "INVALID_CHECKOUT_DETAILS",
    );
  }

  const session = await Order.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.productId")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400, "EMPTY_CART");
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id).session(session);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId._id}`, 400, "PRODUCT_NOT_FOUND");
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400, "INSUFFICIENT_STOCK");
      }

      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        vendorId: product.vendorId,
        fulfillmentStatus: "pending",
      });
    }

    const shippingFee = SHIPPING_FEES[deliveryMethod] || SHIPPING_FEES.standard;
    const totalPrice = subtotal + shippingFee;
    const paymentStatus = paymentMethod === "card" ? "paid" : "unpaid";
    const status = paymentMethod === "card" ? "paid" : "pending";

    const [order] = await Order.create(
      [{
        userId: req.user._id,
        items: orderItems,
        shippingAddress,
        deliveryMethod,
        paymentMethod,
        orderNotes,
        subtotal,
        shippingFee,
        totalPrice,
        status,
        paymentStatus,
      }],
      { session },
    );

    const bulkOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    const bulkResult = await Product.bulkWrite(bulkOps, { session });
    if (bulkResult.modifiedCount !== orderItems.length) {
      throw new AppError("Unable to reserve stock for one or more items", 409, "STOCK_CONFLICT");
    }

    cart.items = [];
    await cart.save({ session });

    if (req.body.saveCheckoutProfile) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          phone: shippingAddress.phone,
          address: buildLegacyAddress(shippingAddress),
          defaultShippingAddress: shippingAddress,
          defaultPaymentMethod: paymentMethod,
        },
        { session },
      );
    }

    await session.commitTransaction();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate("items.productId", "name price")
    .sort({ createdAt: -1 });

  res.json(orders);
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  if (!["pending", "paid"].includes(order.status) || order.paymentStatus === "refunded") {
    throw new AppError("Order cannot be cancelled at this stage", 400, "INVALID_ORDER_STATE");
  }

  order.status = "cancelled";
  order.cancelledBy = "customer";
  order.items = order.items.map((item) => ({ ...item.toObject(), fulfillmentStatus: "cancelled" }));

  await order.save();
  res.json({ message: "Order cancelled", order });
});

const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.vendorId": req.user._id })
    .populate("userId", "name email")
    .populate("items.productId", "name")
    .sort({ createdAt: -1 });

  const vendorOrders = orders.map((order) => {
    const normalizedOrder = order.toObject();
    normalizedOrder.items = normalizedOrder.items.filter(
      (item) => item.vendorId?.toString() === req.user._id.toString(),
    );
    return normalizedOrder;
  });

  res.json(vendorOrders);
});

const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    throw new AppError("Invalid vendor status update", 400, "INVALID_ORDER_STATE");
  }

  const order = await Order.findOne({ _id: req.params.id, "items.vendorId": req.user._id });
  if (!order) {
    throw new AppError("Order not found for this vendor", 404, "ORDER_NOT_FOUND");
  }

  order.items = order.items.map((item) => {
    if (item.vendorId.toString() !== req.user._id.toString()) {
      return item;
    }
    const nextItem = item.toObject();
    nextItem.fulfillmentStatus = status;
    return nextItem;
  });

  const statusSet = new Set(order.items.map((item) => item.fulfillmentStatus));
  if (statusSet.size === 1) {
    order.status = order.items[0].fulfillmentStatus;
  } else if (statusSet.has("shipped") || statusSet.has("delivered")) {
    order.status = "shipped";
  } else {
    order.status = "processing";
  }

  if (status === "cancelled") {
    order.cancelledBy = "vendor";
  }

  await order.save();
  res.json({ message: "Order status updated", order });
});

const getVendorSalesSummary = asyncHandler(async (req, res) => {
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
});

const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .populate("items.productId", "name")
    .sort({ createdAt: -1 });
  res.json(orders);
});

const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  if (status) {
    const validStatuses = ["pending", "processing", "paid", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new AppError("Invalid order status", 400, "INVALID_ORDER_STATE");
    }
    order.status = status;
    if (status === "cancelled") {
      order.cancelledBy = "admin";
      order.items = order.items.map((item) => ({ ...item.toObject(), fulfillmentStatus: "cancelled" }));
    }
  }

  if (paymentStatus) {
    const validPaymentStatuses = ["unpaid", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new AppError("Invalid payment status", 400, "INVALID_PAYMENT_STATE");
    }
    order.paymentStatus = paymentStatus;
  }

  await order.save();
  res.json({ message: "Order updated", order });
});

const getAdminDashboardAnalytics = asyncHandler(async (req, res) => {
  const [totalOrders, totalRevenueData, totalUsers, totalProducts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" } } }
      ]),
      User.countDocuments(),
      Product.countDocuments()
    ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenueData[0]?.revenue || 0,
    totalUsers,
    totalProducts
  });
});

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
