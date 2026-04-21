const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      priceAtPurchase: {
        type: Number,
        required: true
      },
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      fulfillmentStatus: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "processing", "paid", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed", "refunded"],
    default: "unpaid"
  },
  paymentMethod: {
    type: String,
    default: "cod"
  },
  cancelledBy: {
    type: String,
    enum: ["customer", "vendor", "admin", null],
    default: null
  }
}, { timestamps: true });

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ "items.vendorId": 1, createdAt: -1 });
orderSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);