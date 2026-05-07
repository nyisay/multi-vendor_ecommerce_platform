const mongoose = require("mongoose");

const MAX_PRODUCT_IMAGES = 6;

const reviewSchema = new mongoose.Schema({
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
    type: String,
    trim: true,
    default: ""
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, {
  timestamps: true
});

const normalizeProductImageUrls = (imageUrls, imageUrl) => {
  const baseImageUrls = Array.isArray(imageUrls) && imageUrls.length
    ? imageUrls
    : [imageUrl];

  return Array.from(new Set(baseImageUrls.filter(Boolean))).slice(0, MAX_PRODUCT_IMAGES);
};

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
  imageUrls: {
    type: [String],
    default: []
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
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

productSchema.pre("save", function syncProductImageFields() {
  const normalizedImageUrls = normalizeProductImageUrls(this.imageUrls, this.imageUrl);
  this.imageUrls = normalizedImageUrls;
  this.imageUrl = normalizedImageUrls[0];
});

productSchema.index({ createdAt: -1 });
productSchema.index({ categoryId: 1, createdAt: -1 });
productSchema.index({ vendorId: 1, createdAt: -1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
