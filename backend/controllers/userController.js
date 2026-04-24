const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const getToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
const PAYMENT_METHODS = ["cod", "card", "bank_transfer"];

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getStructuredDefaultShippingAddress = (source = {}) => ({
  fullName: normalizeText(source.fullName),
  phone: normalizeText(source.phone),
  addressLine1: normalizeText(source.addressLine1),
  addressLine2: normalizeText(source.addressLine2),
  city: normalizeText(source.city),
  state: normalizeText(source.state),
  postalCode: normalizeText(source.postalCode),
  country: normalizeText(source.country),
});

const getFilePathFromImageUrl = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return null;
  return path.join(__dirname, "..", imageUrl);
};

const removeImageFile = (imageUrl) => {
  const filePath = getFilePathFromImageUrl(imageUrl);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

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

    const defaultShippingAddress = getStructuredDefaultShippingAddress({
      fullName: name,
      phone,
      addressLine1: address,
    });

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      vendorStatus,
      shopName,
      phone,
      address,
      defaultShippingAddress,
      defaultPaymentMethod: "cod"
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
      address: req.user.address,
      defaultShippingAddress: getStructuredDefaultShippingAddress(req.user.defaultShippingAddress),
      defaultPaymentMethod: req.user.defaultPaymentMethod || "cod",
      profileImageUrl: req.user.profileImageUrl,
      profileTheme: req.user.profileTheme,
      profileCardBackgroundUrl: req.user.profileCardBackgroundUrl,
  });
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      shopName,
      password,
      profileTheme,
      removeProfileImage,
      removeProfileBackground,
      defaultShippingFullName,
      defaultShippingPhone,
      defaultShippingAddressLine1,
      defaultShippingAddressLine2,
      defaultShippingCity,
      defaultShippingState,
      defaultShippingPostalCode,
      defaultShippingCountry,
      defaultPaymentMethod,
    } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (shopName !== undefined && user.role === "vendor") user.shopName = shopName;
    if (profileTheme !== undefined) user.profileTheme = profileTheme;

    const nextDefaultShippingAddress = getStructuredDefaultShippingAddress({
      ...user.defaultShippingAddress?.toObject?.(),
      fullName: defaultShippingFullName !== undefined ? defaultShippingFullName : user.defaultShippingAddress?.fullName,
      phone: defaultShippingPhone !== undefined ? defaultShippingPhone : user.defaultShippingAddress?.phone,
      addressLine1: defaultShippingAddressLine1 !== undefined ? defaultShippingAddressLine1 : user.defaultShippingAddress?.addressLine1,
      addressLine2: defaultShippingAddressLine2 !== undefined ? defaultShippingAddressLine2 : user.defaultShippingAddress?.addressLine2,
      city: defaultShippingCity !== undefined ? defaultShippingCity : user.defaultShippingAddress?.city,
      state: defaultShippingState !== undefined ? defaultShippingState : user.defaultShippingAddress?.state,
      postalCode: defaultShippingPostalCode !== undefined ? defaultShippingPostalCode : user.defaultShippingAddress?.postalCode,
      country: defaultShippingCountry !== undefined ? defaultShippingCountry : user.defaultShippingAddress?.country,
    });
    user.defaultShippingAddress = nextDefaultShippingAddress;

    if (PAYMENT_METHODS.includes(defaultPaymentMethod)) {
      user.defaultPaymentMethod = defaultPaymentMethod;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (removeProfileImage === "true" || removeProfileImage === true) {
      removeImageFile(user.profileImageUrl);
      user.profileImageUrl = undefined;
    }

    if (removeProfileBackground === "true" || removeProfileBackground === true) {
      removeImageFile(user.profileCardBackgroundUrl);
      user.profileCardBackgroundUrl = undefined;
    }

    const profileImageFile = req.files?.profileImage?.[0];
    if (profileImageFile) {
      removeImageFile(user.profileImageUrl);
      user.profileImageUrl = `/uploads/${profileImageFile.filename}`;
    }

    const profileBackgroundFile = req.files?.profileCardBackground?.[0];
    if (profileBackgroundFile) {
      removeImageFile(user.profileCardBackgroundUrl);
      user.profileCardBackgroundUrl = `/uploads/${profileBackgroundFile.filename}`;
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
      address: updated.address,
      defaultShippingAddress: getStructuredDefaultShippingAddress(updated.defaultShippingAddress),
      defaultPaymentMethod: updated.defaultPaymentMethod || "cod",
      profileImageUrl: updated.profileImageUrl,
      profileTheme: updated.profileTheme,
      profileCardBackgroundUrl: updated.profileCardBackgroundUrl,
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
