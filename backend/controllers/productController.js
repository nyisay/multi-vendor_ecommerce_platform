const Product = require("../models/Product");
const Category = require("../models/Category");
const {
  buildProductImageObjectPath,
  deleteObjectsByPublicUrls,
  uploadImageBuffer,
} = require("../utils/storageService");

const MAX_PRODUCT_IMAGES = 6;

const PRODUCT_DETAIL_POPULATE = [
  { path: "vendorId", select: "name email" },
  { path: "categoryId", select: "name" },
  { path: "reviews.userId", select: "name profileImageUrl" }
];

const normalizeProductImageUrls = (imageUrls, imageUrl) => {
  const baseImageUrls = Array.isArray(imageUrls) && imageUrls.length
    ? imageUrls
    : [imageUrl];

  return Array.from(new Set(baseImageUrls.filter(Boolean))).slice(0, MAX_PRODUCT_IMAGES);
};

const syncProductImageFields = (product, imageUrls) => {
  const normalizedImageUrls = normalizeProductImageUrls(imageUrls, undefined);
  product.imageUrls = normalizedImageUrls;
  product.imageUrl = normalizedImageUrls[0];
  return product;
};

const getProductImageUrls = (product) =>
  normalizeProductImageUrls(product?.imageUrls, product?.imageUrl);

const getUploadedProductFiles = (req) => {
  const productFiles = [];

  if (Array.isArray(req.files)) {
    productFiles.push(...req.files);
  } else if (req.files && typeof req.files === "object") {
    if (Array.isArray(req.files.images)) {
      productFiles.push(...req.files.images);
    }

    if (Array.isArray(req.files.image)) {
      productFiles.push(...req.files.image);
    }
  }

  return productFiles.slice(0, MAX_PRODUCT_IMAGES);
};

const uploadProductImagesToStorage = async (files, categoryName) => Promise.all(
  files.map((file) => uploadImageBuffer({
    buffer: file.buffer,
    mimeType: file.mimetype,
    objectPath: buildProductImageObjectPath(categoryName, file.originalname),
  }))
);

const keepCurrentProductImages = (currentImageUrls, keepImages) => {
  const requestedImageUrls = Array.isArray(keepImages) ? keepImages : [keepImages];
  const keepSet = new Set(requestedImageUrls.filter(Boolean));
  return currentImageUrls.filter((imageUrl) => keepSet.has(imageUrl));
};

const getTrimmedNewImageUrls = (imageUrls, newlyUploadedImageUrls) => {
  const normalizedImageUrls = normalizeProductImageUrls(imageUrls, undefined);
  const normalizedSet = new Set(normalizedImageUrls);

  return {
    imageUrls: normalizedImageUrls,
    keptUploadedImageUrls: newlyUploadedImageUrls.filter((imageUrl) => normalizedSet.has(imageUrl)),
    trimmedUploadedImageUrls: newlyUploadedImageUrls.filter((imageUrl) => !normalizedSet.has(imageUrl)),
  };
};

const withProductImageGallery = (product) => {
  if (!product) {
    return product;
  }

  const normalizedImageUrls = getProductImageUrls(product);

  if (typeof product.toObject === "function") {
    const normalizedProduct = product.toObject();
    normalizedProduct.imageUrls = normalizedImageUrls;
    normalizedProduct.imageUrl = normalizedImageUrls[0];
    return normalizedProduct;
  }

  return {
    ...product,
    imageUrls: normalizedImageUrls,
    imageUrl: normalizedImageUrls[0]
  };
};

const buildProductDetailQuery = (productId) => Product.findById(productId)
  .populate(PRODUCT_DETAIL_POPULATE);

const calculateAverageRating = (reviews) => {
  if (!reviews.length) {
    return 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return totalRating / reviews.length;
};

const normalizeReviewComment = (comment) => {
  if (typeof comment !== "string") {
    return "";
  }

  return comment.trim();
};

const isSameId = (left, right) => String(left) === String(right);

const parsePositiveNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
};

const buildCatalogBaseFilter = ({ category, q, stockStatus, minRating }) => {
  const filter = {};
  const parsedMinRating = parsePositiveNumber(minRating);

  if (category) {
    filter.categoryId = category;
  }

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } }
    ];
  }

  if (stockStatus === "in_stock") {
    filter.stock = { $gt: 0 };
  }

  if (stockStatus === "out_of_stock") {
    filter.stock = { $lte: 0 };
  }

  if (parsedMinRating !== null) {
    filter.averageRating = { $gte: parsedMinRating };
  }

  return filter;
};

// Create Product (Vendor only)
const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId } = req.body;
    const uploadedImageFiles = getUploadedProductFiles(req);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (req.user.role === "vendor" && req.user.vendorStatus !== "approved") {
      return res.status(403).json({ message: "Vendor account is not approved" });
    }

    const uploadedImageUrls = await uploadProductImagesToStorage(uploadedImageFiles, category.name);

    try {
      const product = await Product.create({
        name,
        price,
        description,
        stock,
        categoryId,
        imageUrl: uploadedImageUrls[0],
        imageUrls: uploadedImageUrls,
        vendorId: req.user._id //from JWT
      });

      res.status(201).json(withProductImageGallery(product));
    } catch (error) {
      await deleteObjectsByPublicUrls(uploadedImageUrls);
      throw error;
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all products
const getProducts = async (req, res) => {
  try {
    const {
      category,
      vendor,
      minPrice,
      maxPrice,
      minRating,
      stockStatus,
      q,
      sortBy = "newest",
      page = 1,
      limit = 12
    } = req.query;

    const baseFilter = buildCatalogBaseFilter({
      category,
      q,
      stockStatus,
      minRating
    });
    const filter = { ...baseFilter };
    const parsedMinPrice = parsePositiveNumber(minPrice);
    const parsedMaxPrice = parsePositiveNumber(maxPrice);

    if (vendor) {
      filter.vendorId = vendor;
    }

    if (parsedMinPrice !== null || parsedMaxPrice !== null) {
      filter.price = {};
      if (parsedMinPrice !== null) filter.price.$gte = parsedMinPrice;
      if (parsedMaxPrice !== null) filter.price.$lte = parsedMaxPrice;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1, createdAt: -1 },
      price_desc: { price: -1, createdAt: -1 },
      rating_desc: { averageRating: -1, createdAt: -1 },
      rating_asc: { averageRating: 1, createdAt: -1 },
      name_asc: { name: 1, createdAt: -1 },
      name_desc: { name: -1, createdAt: -1 }
    };

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const [total, products, discoveryProducts] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate("vendorId", "name")
        .populate("categoryId", "name")
        .sort(sortMap[sortBy] || sortMap.newest)
        .skip(skip)
        .limit(limitNumber),
      Product.find(baseFilter)
        .select("price vendorId")
        .populate("vendorId", "name")
    ]);

    const discoverySummary = discoveryProducts.reduce((summary, item) => {
      const priceValue = Number(item.price || 0);
      const vendorId = item.vendorId?._id ? String(item.vendorId._id) : "";
      const vendorName = item.vendorId?.name || "";

      if (vendorId && vendorName) {
        const vendorEntry = summary.vendors.get(vendorId) || {
          id: vendorId,
          name: vendorName,
          productCount: 0
        };
        vendorEntry.productCount += 1;
        summary.vendors.set(vendorId, vendorEntry);
      }

      if (summary.priceRange.min === null || priceValue < summary.priceRange.min) {
        summary.priceRange.min = priceValue;
      }

      if (summary.priceRange.max === null || priceValue > summary.priceRange.max) {
        summary.priceRange.max = priceValue;
      }

      return summary;
    }, {
      vendors: new Map(),
      priceRange: {
        min: null,
        max: null
      }
    });

    res.json({
      items: products.map(withProductImageGallery),
      filters: {
        vendors: Array.from(discoverySummary.vendors.values()).sort((left, right) =>
          left.name.localeCompare(right.name)
        ),
        priceRange: {
          min: discoverySummary.priceRange.min ?? 0,
          max: discoverySummary.priceRange.max ?? 0
        }
      },
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get respective vendors' product
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.user._id })
      .populate("categoryId", "name");

    res.json(products.map(withProductImageGallery));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByVendor = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId })
      .populate("categoryId", "name")
      .populate("vendorId", "name");
    res.json(products.map(withProductImageGallery));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await buildProductDetailQuery(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(withProductImageGallery(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//update
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId, removeImage, keepImages } = req.body;
    const uploadedImageFiles = getUploadedProductFiles(req);

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //Check ownership
    if (req.user.role !== "admin" && product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    let category = null;
    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    // Update fields
    product.name = name || product.name;
    product.price = price ?? product.price;
    product.description = description || product.description;
    product.stock = stock ?? product.stock;
    product.categoryId = categoryId || product.categoryId;

    const currentImageUrls = getProductImageUrls(product);
    let nextImageUrls = [...currentImageUrls];
    let imageUrlsToDeleteAfterSave = [];

    // 1. Handle keepImages if provided (filtering out removed ones)
    if (keepImages) {
      nextImageUrls = keepCurrentProductImages(currentImageUrls, keepImages);
      imageUrlsToDeleteAfterSave = currentImageUrls.filter((imageUrl) => !nextImageUrls.includes(imageUrl));
    } else if (removeImage === "true" || removeImage === true) {
      // 2. Handle legacy removeImage (remove everything)
      imageUrlsToDeleteAfterSave = [...currentImageUrls];
      nextImageUrls = [];
    }

    const categoryForUpload = category || await Category.findById(product.categoryId).select("name");
    const uploadedImageUrls = await uploadProductImagesToStorage(
      uploadedImageFiles,
      categoryForUpload?.name
    );

    const {
      imageUrls: normalizedNextImageUrls,
      keptUploadedImageUrls,
      trimmedUploadedImageUrls,
    } = getTrimmedNewImageUrls(
      [...nextImageUrls, ...uploadedImageUrls],
      uploadedImageUrls
    );

    if (trimmedUploadedImageUrls.length) {
      await deleteObjectsByPublicUrls(trimmedUploadedImageUrls);
    }

    syncProductImageFields(product, normalizedNextImageUrls);

    try {
      const updatedProduct = await product.save();

      await deleteObjectsByPublicUrls(imageUrlsToDeleteAfterSave);

      res.json(withProductImageGallery(updatedProduct));
    } catch (error) {
      await deleteObjectsByPublicUrls(keptUploadedImageUrls);
      throw error;
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//delete
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //Check ownership
    if (req.user.role !== "admin" && product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await deleteObjectsByPublicUrls(getProductImageUrls(product));
    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const ratingValue = Number(rating);

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === req.user._id.toString()
    );
    const nextComment = normalizeReviewComment(comment);

    if (existingReview) {
      existingReview.rating = ratingValue;
      existingReview.comment = nextComment;
    } else {
      product.reviews.push({
        userId: req.user._id,
        rating: ratingValue,
        comment: nextComment
      });
    }

    product.averageRating = calculateAverageRating(product.reviews);

    await product.save();
    const hydratedProduct = await buildProductDetailQuery(product._id);

    res.json({
      message: existingReview ? "Review updated" : "Review added",
      averageRating: product.averageRating,
      product: withProductImageGallery(hydratedProduct)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reactToProductReview = async (req, res) => {
  try {
    const { reaction } = req.body;

    if (!["like", "dislike"].includes(reaction)) {
      return res.status(400).json({ message: "Reaction must be like or dislike" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (isSameId(review.userId, req.user._id)) {
      return res.status(400).json({ message: "You cannot react to your own review" });
    }

    const likeIndex = review.likes.findIndex((userId) => isSameId(userId, req.user._id));
    const dislikeIndex = review.dislikes.findIndex((userId) => isSameId(userId, req.user._id));

    if (reaction === "like") {
      if (likeIndex >= 0) {
        review.likes.splice(likeIndex, 1);
      } else {
        if (dislikeIndex >= 0) {
          review.dislikes.splice(dislikeIndex, 1);
        }
        review.likes.push(req.user._id);
      }
    }

    if (reaction === "dislike") {
      if (dislikeIndex >= 0) {
        review.dislikes.splice(dislikeIndex, 1);
      } else {
        if (likeIndex >= 0) {
          review.likes.splice(likeIndex, 1);
        }
        review.dislikes.push(req.user._id);
      }
    }

    await product.save();
    const hydratedProduct = await buildProductDetailQuery(product._id);

    res.json({
      message: "Reaction saved",
      product: withProductImageGallery(hydratedProduct)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!isSameId(product.vendorId, req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete reviews for this product" });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    product.reviews.pull(review._id);
    product.averageRating = calculateAverageRating(product.reviews);

    await product.save();
    const hydratedProduct = await buildProductDetailQuery(product._id);

    res.json({
      message: "Review deleted",
      averageRating: product.averageRating,
      product: withProductImageGallery(hydratedProduct)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendorId", "name email")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });
    res.json(products.map(withProductImageGallery));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductsByVendor,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  reactToProductReview,
  deleteProductReview,
  getAllProductsAdmin
};
