const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, shopName, phone, address } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const requestedRole = role === "vendor" || role === "admin" ? role : "customer";
    const finalRole = requestedRole === "admin" ? "customer" : requestedRole;
    const vendorStatus = finalRole === "vendor" ? "pending" : "none";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      vendorStatus,
      shopName,
      phone,
      address
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorStatus: user.vendorStatus
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.role === "vendor" && user.vendorStatus !== "approved") {
      return res.status(403).json({ message: "Vendor account is pending admin approval" });
    }

    res.json({
      token: getToken(user._id),
      role: user.role,
      vendorStatus: user.vendorStatus
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    vendorStatus: req.user.vendorStatus,
    shopName: req.user.shopName,
    phone: req.user.phone,
    address: req.user.address
  });
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address, shopName, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (shopName !== undefined && user.role === "vendor") user.shopName = shopName;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      vendorStatus: updated.vendorStatus,
      shopName: updated.shopName,
      phone: updated.phone,
      address: updated.address
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendors = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = { role: "vendor" };
    if (status) filter.vendorStatus = status;

    const vendors = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.vendorStatus = status;
    await vendor.save();

    res.json({
      message: "Vendor status updated",
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        vendorStatus: vendor.vendorStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getVendors,
  updateVendorStatus
};