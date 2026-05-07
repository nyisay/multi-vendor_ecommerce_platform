const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const {
  buildUserAssetObjectPath,
  deleteObjectByPublicUrl,
  uploadImageBuffer,
} = require("../utils/storageService");
const {
  normalizeText,
  normalizeEmail,
  getPasswordValidationError,
} = require("../utils/authValidation");

const getToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
const PAYMENT_METHODS = ["cod", "card", "bank_transfer"];
const PASSWORD_RESET_EXPIRY_MS = 10 * 60 * 1000;

const hashVerificationCode = (code) =>
  crypto.createHash("sha256").update(String(code || "")).digest("hex");

const createVerificationCode = () => String(crypto.randomInt(100000, 1000000));

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

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  vendorStatus: user.vendorStatus,
  isBanned: Boolean(user.isBanned),
  shopName: user.shopName,
  phone: user.phone,
  address: user.address,
  defaultShippingAddress: getStructuredDefaultShippingAddress(user.defaultShippingAddress),
  defaultPaymentMethod: user.defaultPaymentMethod || "cod",
  profileImageUrl: user.profileImageUrl,
  profileTheme: user.profileTheme,
  profileCardBackgroundUrl: user.profileCardBackgroundUrl,
});

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, shopName, phone, address } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const passwordError = getPasswordValidationError(password);

    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const userExists = await User.findOne({ email: normalizedEmail });

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
      email: normalizedEmail,
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
      vendorStatus: user.vendorStatus,
      isBanned: user.isBanned
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    if (user.role === "vendor" && user.vendorStatus !== "approved") {
      return res.status(403).json({ message: "Vendor account is pending admin approval" });
    }

    res.json({
      token: getToken(user._id),
      role: user.role,
      vendorStatus: user.vendorStatus,
      isBanned: user.isBanned
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyProfile = async (req, res) => {
    res.json(toPublicUser(req.user));
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      shopName,
      password: legacyPassword,
      profileTheme,
      removeProfileImage,
      removeProfileBackground,
      currentPassword,
      newPassword,
      confirmNewPassword,
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
    const requestedPassword = String(newPassword || legacyPassword || "");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousProfileImageUrl = user.profileImageUrl;
    const previousProfileBackgroundUrl = user.profileCardBackgroundUrl;

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

    if (requestedPassword || currentPassword || confirmNewPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change your password" });
      }

      const isCurrentPasswordMatch = await bcrypt.compare(String(currentPassword), user.password);
      if (!isCurrentPasswordMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (!requestedPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      const passwordError = getPasswordValidationError(requestedPassword);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

      if (requestedPassword !== String(confirmNewPassword || "")) {
        return res.status(400).json({ message: "New password and confirm password do not match" });
      }

      const isSamePassword = await bcrypt.compare(requestedPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: "New password must be different from your current password" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(requestedPassword, salt);
    }

    let uploadedProfileImageUrl;
    let uploadedProfileBackgroundUrl;

    const profileImageFile = req.files?.profileImage?.[0];
    if (profileImageFile) {
      uploadedProfileImageUrl = await uploadImageBuffer({
        buffer: profileImageFile.buffer,
        mimeType: profileImageFile.mimetype,
        objectPath: buildUserAssetObjectPath(user._id, "profile", profileImageFile.originalname),
      });
    }

    const profileBackgroundFile = req.files?.profileCardBackground?.[0];
    if (profileBackgroundFile) {
      uploadedProfileBackgroundUrl = await uploadImageBuffer({
        buffer: profileBackgroundFile.buffer,
        mimeType: profileBackgroundFile.mimetype,
        objectPath: buildUserAssetObjectPath(user._id, "background", profileBackgroundFile.originalname),
      });
    }

    const profileImageShouldBeDeletedAfterSave =
      Boolean(previousProfileImageUrl) && ((removeProfileImage === "true" || removeProfileImage === true) || profileImageFile);

    const profileBackgroundShouldBeDeletedAfterSave =
      Boolean(previousProfileBackgroundUrl) && ((removeProfileBackground === "true" || removeProfileBackground === true) || profileBackgroundFile);

    if (removeProfileImage === "true" || removeProfileImage === true) {
      user.profileImageUrl = undefined;
    }

    if (removeProfileBackground === "true" || removeProfileBackground === true) {
      user.profileCardBackgroundUrl = undefined;
    }

    if (uploadedProfileImageUrl) {
      user.profileImageUrl = uploadedProfileImageUrl;
    }

    if (uploadedProfileBackgroundUrl) {
      user.profileCardBackgroundUrl = uploadedProfileBackgroundUrl;
    }

    try {
      const updated = await user.save();

      if (profileImageShouldBeDeletedAfterSave) {
        await deleteObjectByPublicUrl(previousProfileImageUrl);
      }

      if (profileBackgroundShouldBeDeletedAfterSave) {
        await deleteObjectByPublicUrl(previousProfileBackgroundUrl);
      }

      res.json(toPublicUser(updated));
    } catch (error) {
      if (uploadedProfileImageUrl) {
        await deleteObjectByPublicUrl(uploadedProfileImageUrl);
      }

      if (uploadedProfileBackgroundUrl) {
        await deleteObjectByPublicUrl(uploadedProfileBackgroundUrl);
      }

      throw error;
    }
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

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const user = await User.findOne({ email: normalizedEmail });
    const successMessage = "If an account with that email exists, a 6-digit verification code has been sent.";

    if (!user) {
      return res.status(200).json({ message: successMessage });
    }

    const verificationCode = createVerificationCode();
    user.passwordResetCodeHash = hashVerificationCode(verificationCode);
    user.passwordResetCodeExpire = Date.now() + PASSWORD_RESET_EXPIRY_MS;

    await user.save();

    const message = [
      `Your MultiVendor verification code is ${verificationCode}.`,
      "",
      "Enter this 6-digit code on the reset password screen to create a new password.",
      "This code will expire in 10 minutes.",
      "",
      "If you did not request this change, you can safely ignore this email.",
    ].join("\n");

    try {
      await sendEmail({
        email: user.email,
        subject: "Your MultiVendor password reset code",
        message,
      });

      res.status(200).json({ message: successMessage });
    } catch (error) {
      console.error("Failed to send password reset email:", error.message);
      user.passwordResetCodeHash = undefined;
      user.passwordResetCodeExpire = undefined;

      await user.save();

      return res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Email could not be sent"
            : `Email could not be sent: ${error.message}`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = normalizeText(req.body.code);
    const password = String(req.body.password || "");
    const confirmPassword = String(req.body.confirmPassword || "");
    const passwordError = getPasswordValidationError(password);

    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      email,
      passwordResetCodeHash: hashVerificationCode(code),
      passwordResetCodeExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetCodeHash = undefined;
    user.passwordResetCodeExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful. Please sign in with your new password." });
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

const updateUserBanStatus = async (req, res) => {
  try {
    const { isBanned } = req.body;

    if (typeof isBanned !== "boolean") {
      return res.status(400).json({ message: "isBanned must be a boolean value" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot ban your own account" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be banned" });
    }

    user.isBanned = isBanned;
    await user.save();

    res.json({
      message: isBanned ? "User banned successfully" : "User unbanned successfully",
      user: toPublicUser(user),
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
  updateVendorStatus,
  updateUserBanStatus,
  forgotPassword,
  resetPassword
};
