const mongoose = require("mongoose");

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