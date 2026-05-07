const multer = require("multer");

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed"), false);
};

const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadProfileAssets = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

module.exports = { uploadProductImages, uploadProfileAssets };
