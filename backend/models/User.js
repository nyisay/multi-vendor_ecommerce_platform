const mongoose = require("mongoose");

const defaultShippingAddressSchema = new mongoose.Schema({
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

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["customer", "vendor", "admin"],
    default: "customer"
  },
  vendorStatus: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none"
  },
  shopName: {
    type: String // only for vendor
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  defaultShippingAddress: {
    type: defaultShippingAddressSchema,
    default: () => ({})
  },
  defaultPaymentMethod: {
    type: String,
    enum: ["cod", "card", "bank_transfer"],
    default: "cod"
  },
  profileImageUrl: {
    type: String
  },
  profileTheme: {
    type: String,
    enum: ["ocean", "sunset", "midnight", "forest", "custom"],
    default: "ocean"
  },
  profileCardBackgroundUrl: {
    type: String
  }
}, {
  timestamps: true
});

userSchema.index({ role: 1, vendorStatus: 1, createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
