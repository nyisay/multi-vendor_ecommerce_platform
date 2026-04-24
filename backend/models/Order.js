const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    default: ""
  },
  phone: {
    type: String,
    trim: true,
    default: ""
  },
  addressLine1: {
    type: String,
    trim: true,
    default: ""
  },
  addressLine2: {
    type: String,
    trim: true,
    default: ""
  },
  city: {
    type: String,
    trim: true,
    default: ""
  },
  state: {
    type: String,
    trim: true,
    default: ""
  },
  postalCode: {
    type: String,
    trim: true,
    default: ""
  },
  country: {
    type: String,
    trim: true,
    default: ""
  }
}, { _id: false });

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
  subtotal: {
    type: Number,
    default: 0
  },
  shippingFee: {
    type: Number,
    default: 0
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
    enum: ["cod", "card", "bank_transfer"],
    default: "cod"
  },
  deliveryMethod: {
    type: String,
    enum: ["standard", "express"],
    default: "standard"
  },
  shippingAddress: {
    type: shippingAddressSchema,
    default: () => ({})
  },
  orderNotes: {
    type: String,
    trim: true,
    default: ""
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
