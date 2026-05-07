const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("./errorHandler");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new AppError("User not found", 401, "UNAUTHORIZED"));
      }

      if (user.isBanned) {
        return next(new AppError("Your account has been banned", 403, "ACCOUNT_BANNED"));
      }

      req.user = user;

      next();
    } catch (error) {
      next(new AppError("Not authorized", 401, "UNAUTHORIZED"));
    }
  } else {
    next(new AppError("No token", 401, "UNAUTHORIZED"));
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403, "FORBIDDEN"));
    }
    if (req.user.role === "vendor" && req.user.vendorStatus !== "approved") {
      return next(new AppError("Vendor is not approved yet", 403, "FORBIDDEN"));
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
