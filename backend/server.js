const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",") : "*",
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  req.requestId = req.headers["x-request-id"] || `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  res.setHeader("x-request-id", req.requestId);
  next();
});
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/api/users/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }),
);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);

const { protect, authorizeRoles } = require("./middleware/authMiddleware");

// Only vendors allowed
app.get("/api/protected", protect, authorizeRoles("vendor"), (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

//Product route
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

//Category route
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);

//Cart route
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

//Order route
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Connect MongoDB
const connectDb = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
};

// Start server
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  connectDb()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { app, connectDb };