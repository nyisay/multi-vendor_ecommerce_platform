class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    code: err.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
    message: err.message || "Something went wrong",
  };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
};

const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
};

module.exports = { AppError, errorHandler, notFoundHandler };
