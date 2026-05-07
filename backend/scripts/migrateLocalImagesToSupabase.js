const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const {
  deleteObjectsByPublicUrls,
  sanitizeFileName,
  slugifyCategoryFolder,
  uploadImageBuffer,
} = require("../utils/storageService");

const uploadsRoot = path.join(__dirname, "..", "uploads");

const normalizeProductImageUrls = (imageUrls, imageUrl) => {
  const baseImageUrls = Array.isArray(imageUrls) && imageUrls.length
    ? imageUrls
    : [imageUrl];

  return Array.from(new Set(baseImageUrls.filter(Boolean))).slice(0, 6);
};

const isLocalUploadUrl = (value) => typeof value === "string" && value.startsWith("/uploads/");

const getLocalFilePath = (imageUrl) => path.join(uploadsRoot, imageUrl.replace(/^\/uploads\/+/, ""));

const getMimeTypeFromExtension = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
};

const uploadLocalFile = async (localImageUrl, objectPath) => {
  const filePath = getLocalFilePath(localImageUrl);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Local file not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  return uploadImageBuffer({
    buffer: fileBuffer,
    mimeType: getMimeTypeFromExtension(filePath),
    objectPath,
  });
};

const migrateProducts = async (summary) => {
  const products = await Product.find()
    .populate("categoryId", "name")
    .cursor();

  for await (const product of products) {
    const currentImageUrls = normalizeProductImageUrls(product.imageUrls, product.imageUrl);
    const localImageUrls = currentImageUrls.filter(isLocalUploadUrl);

    if (!localImageUrls.length) {
      summary.productsSkipped += 1;
      continue;
    }

    const categoryFolder = slugifyCategoryFolder(product.categoryId?.name);
    const uploadedUrls = [];
    const migratedMap = new Map();

    try {
      for (const imageUrl of localImageUrls) {
        const fileName = sanitizeFileName(path.basename(imageUrl));
        const publicUrl = await uploadLocalFile(imageUrl, `${categoryFolder}/${fileName}`);
        uploadedUrls.push(publicUrl);
        migratedMap.set(imageUrl, publicUrl);
      }

      const nextImageUrls = currentImageUrls.map((imageUrl) => migratedMap.get(imageUrl) || imageUrl);
      product.imageUrls = nextImageUrls;
      product.imageUrl = nextImageUrls[0];
      await product.save();

      summary.productsMigrated += 1;
      summary.productImagesMigrated += localImageUrls.length;
    } catch (error) {
      await deleteObjectsByPublicUrls(uploadedUrls);
      summary.failures.push(`Product ${product._id}: ${error.message}`);
    }
  }
};

const migrateUsers = async (summary) => {
  const users = await User.find().cursor();

  for await (const user of users) {
    const uploadedUrls = [];
    let changed = false;

    try {
      if (isLocalUploadUrl(user.profileImageUrl)) {
        const fileName = sanitizeFileName(path.basename(user.profileImageUrl));
        user.profileImageUrl = await uploadLocalFile(
          user.profileImageUrl,
          `Users/${String(user._id)}/Profile/${fileName}`
        );
        uploadedUrls.push(user.profileImageUrl);
        changed = true;
        summary.userImagesMigrated += 1;
      }

      if (isLocalUploadUrl(user.profileCardBackgroundUrl)) {
        const fileName = sanitizeFileName(path.basename(user.profileCardBackgroundUrl));
        user.profileCardBackgroundUrl = await uploadLocalFile(
          user.profileCardBackgroundUrl,
          `Users/${String(user._id)}/Background/${fileName}`
        );
        uploadedUrls.push(user.profileCardBackgroundUrl);
        changed = true;
        summary.userImagesMigrated += 1;
      }

      if (!changed) {
        summary.usersSkipped += 1;
        continue;
      }

      await user.save();
      summary.usersMigrated += 1;
    } catch (error) {
      await deleteObjectsByPublicUrls(uploadedUrls);
      summary.failures.push(`User ${user._id}: ${error.message}`);
    }
  }
};

const main = async () => {
  const summary = {
    productsMigrated: 0,
    productsSkipped: 0,
    productImagesMigrated: 0,
    usersMigrated: 0,
    usersSkipped: 0,
    userImagesMigrated: 0,
    failures: [],
  };

  if (!process.env.MONGO_URI) {
    throw new Error("Missing required environment variable: MONGO_URI");
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    await migrateProducts(summary);
    await migrateUsers(summary);

    console.log("Image migration completed.");
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error("Image migration failed:", error.message);
  process.exitCode = 1;
});
