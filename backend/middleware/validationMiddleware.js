const mongoose = require("mongoose");
const { AppError } = require("./errorHandler");

const validateObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const requireObjectIdParam = (paramName) => (req, _res, next) => {
  if (!validateObjectId(req.params[paramName])) {
    return next(new AppError(`Invalid ${paramName}`, 400, "INVALID_ID"));
  }
  return next();
};

const validateRegister = (req, _res, next) => {
  const { name, email, password } = req.body;
  if (!name || String(name).trim().length < 2) {
    return next(new AppError("Name is required", 400, "VALIDATION_ERROR"));
  }
  if (!email || !String(email).includes("@")) {
    return next(new AppError("Valid email is required", 400, "VALIDATION_ERROR"));
  }
  if (!password || String(password).length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR"));
  }
  return next();
};

const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400, "VALIDATION_ERROR"));
  }
  return next();
};

const validateCreateProduct = (req, _res, next) => {
  const { name, price, stock, categoryId } = req.body;
  if (!name || String(name).trim().length < 2) {
    return next(new AppError("Product name is required", 400, "VALIDATION_ERROR"));
  }
  if (!categoryId || !validateObjectId(categoryId)) {
    return next(new AppError("Valid categoryId is required", 400, "VALIDATION_ERROR"));
  }
  if (Number(price) < 0 || Number.isNaN(Number(price))) {
    return next(new AppError("Price must be a non-negative number", 400, "VALIDATION_ERROR"));
  }
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return next(new AppError("Stock must be a non-negative integer", 400, "VALIDATION_ERROR"));
  }
  return next();
};

const validateCartPayload = (req, _res, next) => {
  const { productId, quantity } = req.body;
  if (!productId || !validateObjectId(productId)) {
    return next(new AppError("Valid productId is required", 400, "VALIDATION_ERROR"));
  }
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return next(new AppError("Quantity must be at least 1", 400, "VALIDATION_ERROR"));
  }
  return next();
};

module.exports = {
  requireObjectIdParam,
  validateRegister,
  validateLogin,
  validateCreateProduct,
  validateCartPayload,
};
