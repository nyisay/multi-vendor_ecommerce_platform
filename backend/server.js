const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));