const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      comment: {
        type: String
      }
    }
  ],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

productSchema.index({ createdAt: -1 });
productSchema.index({ categoryId: 1, createdAt: -1 });
productSchema.index({ vendorId: 1, createdAt: -1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);