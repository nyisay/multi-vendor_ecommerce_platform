const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

jest.mock("../utils/sendEmail", () => jest.fn());
const mockSupabaseState = {
  uploads: [],
  removes: [],
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(async (objectPath, buffer, options = {}) => {
          mockSupabaseState.uploads.push({
            objectPath,
            bufferLength: buffer?.length || 0,
            options,
          });
          return { data: { path: objectPath }, error: null };
        }),
        remove: jest.fn(async (objectPaths) => {
          mockSupabaseState.removes.push(...objectPaths);
          return { data: objectPaths.map((path) => ({ name: path })), error: null };
        }),
        getPublicUrl: jest.fn((objectPath) => ({
          data: {
            publicUrl: `https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/${objectPath}`,
          },
        })),
      })),
    },
  })),
}));

const sendEmail = require("../utils/sendEmail");
const { app } = require("../server");
const User = require("../models/User");
const Category = require("../models/Category");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

let mongoServer;

const createToken = (userId) => jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET);
const buildShippingAddress = (overrides = {}) => ({
  fullName: "Test Customer",
  phone: "555-0100",
  addressLine1: "221B Baker Street",
  addressLine2: "",
  city: "London",
  state: "Greater London",
  postalCode: "NW1",
  country: "UK",
  ...overrides,
});

const seedReviewFixture = async () => {
  const vendor = await User.create({
    name: "Vendor Owner",
    email: `vendor-${Date.now()}@example.com`,
    password: "password123",
    role: "vendor",
    vendorStatus: "approved"
  });

  const customer = await User.create({
    name: "Review Author",
    email: `customer-${Date.now()}@example.com`,
    password: "password123",
    role: "customer"
  });

  const secondCustomer = await User.create({
    name: "Reaction User",
    email: `customer-two-${Date.now()}@example.com`,
    password: "password123",
    role: "customer"
  });

  const category = await Category.create({ name: `Category ${Date.now()}` });

  const product = await Product.create({
    name: "Trail Runner",
    price: 120,
    description: "Comfortable shoes",
    stock: 8,
    vendorId: vendor._id,
    categoryId: category._id
  });

  return { vendor, customer, secondCustomer, category, product };
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.SUPABASE_URL = "https://xmtebmsobqfkvpoylryo.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  process.env.SUPABASE_STORAGE_BUCKET = "Multi-Vendor Ecommerce Platform";
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(() => {
  sendEmail.mockReset();
  sendEmail.mockResolvedValue(undefined);
  mockSupabaseState.uploads.length = 0;
  mockSupabaseState.removes.length = 0;
});

afterEach(async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({ }))
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("API smoke tests", () => {
  it("returns API status", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("API is running");
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.statusCode).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });
});

describe("user bans", () => {
  it("prevents banned users from logging in", async () => {
    const email = `banned-${Date.now()}@example.com`;

    await User.create({
      name: "Banned Customer",
      email,
      password: await bcrypt.hash("password123", 10),
      role: "customer",
      isBanned: true,
    });

    const response = await request(app)
      .post("/api/users/login")
      .send({ email, password: "password123" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toContain("banned");
  });

  it("allows an admin to ban and unban a non-admin user", async () => {
    const admin = await User.create({
      name: "Admin User",
      email: `admin-${Date.now()}@example.com`,
      password: "password123",
      role: "admin",
    });
    const customer = await User.create({
      name: "Customer User",
      email: `customer-ban-${Date.now()}@example.com`,
      password: "password123",
      role: "customer",
    });

    const banResponse = await request(app)
      .put(`/api/users/${customer._id}/ban`)
      .set("Authorization", `Bearer ${createToken(admin._id)}`)
      .send({ isBanned: true });

    expect(banResponse.statusCode).toBe(200);
    expect(banResponse.body.user.isBanned).toBe(true);

    const bannedProfileResponse = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${createToken(customer._id)}`);

    expect(bannedProfileResponse.statusCode).toBe(403);
    expect(bannedProfileResponse.body.message).toContain("banned");

    const unbanResponse = await request(app)
      .put(`/api/users/${customer._id}/ban`)
      .set("Authorization", `Bearer ${createToken(admin._id)}`)
      .send({ isBanned: false });

    expect(unbanResponse.statusCode).toBe(200);
    expect(unbanResponse.body.user.isBanned).toBe(false);
  });
});

describe("password recovery", () => {
  it("sends a six-digit verification code and resets the password", async () => {
    const email = `recover-${Date.now()}@example.com`;
    await User.create({
      name: "Recovery User",
      email,
      password: await bcrypt.hash("Current1!", 10),
      role: "customer",
    });

    const forgotResponse = await request(app)
      .post("/api/users/forgotpassword")
      .send({ email });

    expect(forgotResponse.statusCode).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const emailPayload = sendEmail.mock.calls[0][0];
    const verificationCodeMatch = emailPayload.message.match(/\b\d{6}\b/);
    expect(verificationCodeMatch).toBeTruthy();

    const storedUserWithCode = await User.findOne({ email });
    expect(storedUserWithCode.passwordResetCodeHash).toBeTruthy();
    expect(storedUserWithCode.passwordResetCodeExpire).toBeTruthy();

    const resetResponse = await request(app)
      .put("/api/users/resetpassword")
      .send({
        email,
        code: verificationCodeMatch[0],
        password: "NewPass1!",
        confirmPassword: "NewPass1!",
      });

    expect(resetResponse.statusCode).toBe(200);
    expect(resetResponse.body.message).toContain("sign in");

    const updatedUser = await User.findOne({ email });
    expect(await bcrypt.compare("NewPass1!", updatedUser.password)).toBe(true);
    expect(updatedUser.passwordResetCodeHash).toBeUndefined();
    expect(updatedUser.passwordResetCodeExpire).toBeUndefined();
  });

  it("requires the current password when updating a profile password", async () => {
    const user = await User.create({
      name: "Profile User",
      email: `profile-${Date.now()}@example.com`,
      password: await bcrypt.hash("Current1!", 10),
      role: "customer",
    });

    const response = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${createToken(user._id)}`)
      .send({
        currentPassword: "Current1!",
        newPassword: "Updated1!",
        confirmNewPassword: "Updated1!",
      });

    expect(response.statusCode).toBe(200);

    const updatedUser = await User.findById(user._id);
    expect(await bcrypt.compare("Updated1!", updatedUser.password)).toBe(true);
  });
});

describe("product reviews", () => {
  it("allows a customer to add a review to a product", async () => {
    const { customer, product } = await seedReviewFixture();

    const response = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({ rating: 5, comment: "Excellent product" });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Review added");
    expect(response.body.product.averageRating).toBe(5);
    expect(response.body.product.reviews).toHaveLength(1);
    expect(response.body.product.reviews[0].comment).toBe("Excellent product");
    expect(response.body.product.reviews[0].userId.name).toBe("Review Author");
  });

  it("allows another customer to like and dislike a review", async () => {
    const { customer, secondCustomer, product } = await seedReviewFixture();

    const reviewResponse = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({ rating: 4, comment: "Solid purchase" });

    const reviewId = reviewResponse.body.product.reviews[0]._id;

    const likeResponse = await request(app)
      .post(`/api/products/${product._id}/reviews/${reviewId}/reactions`)
      .set("Authorization", `Bearer ${createToken(secondCustomer._id)}`)
      .send({ reaction: "like" });

    expect(likeResponse.statusCode).toBe(200);
    expect(likeResponse.body.product.reviews[0].likes).toHaveLength(1);
    expect(likeResponse.body.product.reviews[0].dislikes).toHaveLength(0);

    const dislikeResponse = await request(app)
      .post(`/api/products/${product._id}/reviews/${reviewId}/reactions`)
      .set("Authorization", `Bearer ${createToken(secondCustomer._id)}`)
      .send({ reaction: "dislike" });

    expect(dislikeResponse.statusCode).toBe(200);
    expect(dislikeResponse.body.product.reviews[0].likes).toHaveLength(0);
    expect(dislikeResponse.body.product.reviews[0].dislikes).toHaveLength(1);

    const ownReactionResponse = await request(app)
      .post(`/api/products/${product._id}/reviews/${reviewId}/reactions`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({ reaction: "like" });

    expect(ownReactionResponse.statusCode).toBe(400);
    expect(ownReactionResponse.body.message).toContain("own review");
  });

  it("allows the product vendor to delete a review", async () => {
    const { vendor, customer, product } = await seedReviewFixture();

    const reviewResponse = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({ rating: 3, comment: "Average overall" });

    const reviewId = reviewResponse.body.product.reviews[0]._id;

    const deleteResponse = await request(app)
      .delete(`/api/products/${product._id}/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${createToken(vendor._id)}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.message).toBe("Review deleted");
    expect(deleteResponse.body.product.reviews).toHaveLength(0);
    expect(deleteResponse.body.product.averageRating).toBe(0);
  });
});

describe("product catalog filters", () => {
  it("supports advanced filtering and returns discovery metadata", async () => {
    const category = await Category.create({ name: `Audio ${Date.now()}` });
    const vendorA = await User.create({
      name: "Filter Vendor A",
      email: `vendor-a-${Date.now()}@example.com`,
      password: "password123",
      role: "vendor",
      vendorStatus: "approved"
    });
    const vendorB = await User.create({
      name: "Filter Vendor B",
      email: `vendor-b-${Date.now()}@example.com`,
      password: "password123",
      role: "vendor",
      vendorStatus: "approved"
    });

    await Product.create({
      name: "Alpha Headphones",
      price: 120,
      description: "Wireless over-ear audio",
      stock: 5,
      vendorId: vendorA._id,
      categoryId: category._id,
      averageRating: 4.4
    });

    await Product.create({
      name: "Budget Headphones",
      price: 60,
      description: "Entry-level audio",
      stock: 10,
      vendorId: vendorA._id,
      categoryId: category._id,
      averageRating: 2.8
    });

    await Product.create({
      name: "Studio Headphones",
      price: 180,
      description: "Premium audio monitoring",
      stock: 7,
      vendorId: vendorB._id,
      categoryId: category._id,
      averageRating: 4.8
    });

    await Product.create({
      name: "Archived Headphones",
      price: 140,
      description: "Out of stock audio gear",
      stock: 0,
      vendorId: vendorB._id,
      categoryId: category._id,
      averageRating: 4.5
    });

    const response = await request(app)
      .get("/api/products")
      .query({
        category: category._id.toString(),
        q: "head",
        vendor: vendorA._id.toString(),
        minRating: 4,
        stockStatus: "in_stock",
        minPrice: 100,
        maxPrice: 150,
        sortBy: "rating_desc"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].name).toBe("Alpha Headphones");
    expect(response.body.pagination.total).toBe(1);
    expect(response.body.filters.priceRange).toEqual({ min: 120, max: 180 });
    expect(response.body.filters.vendors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: String(vendorA._id),
          name: "Filter Vendor A",
          productCount: 1
        }),
        expect.objectContaining({
          id: String(vendorB._id),
          name: "Filter Vendor B",
          productCount: 1
        })
      ])
    );
  });
});

describe("Supabase image storage", () => {
  it("uploads product images to the category folder and stores public URLs", async () => {
    const vendor = await User.create({
      name: "Image Vendor",
      email: `image-vendor-${Date.now()}@example.com`,
      password: "password123",
      role: "vendor",
      vendorStatus: "approved",
    });
    const category = await Category.create({ name: "Accessories" });

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${createToken(vendor._id)}`)
      .field("name", "Cable Organizer")
      .field("price", "25")
      .field("stock", "9")
      .field("categoryId", category._id.toString())
      .field("description", "Neat desk setup helper")
      .attach("images", Buffer.from("image-one"), "product one.webp")
      .attach("images", Buffer.from("image-two"), "product two.webp");

    expect(response.statusCode).toBe(201);
    expect(response.body.imageUrls).toHaveLength(2);
    expect(response.body.imageUrls[0]).toContain("/Accessories/");
    expect(response.body.imageUrls[1]).toContain("/Accessories/");
    expect(mockSupabaseState.uploads).toHaveLength(2);
    expect(mockSupabaseState.uploads[0].objectPath).toMatch(/^Accessories\//);
    expect(mockSupabaseState.uploads[1].objectPath).toMatch(/^Accessories\//);
  });

  it("keeps selected product images, uploads new ones to the new category folder, and deletes dropped objects", async () => {
    const vendor = await User.create({
      name: "Gallery Vendor",
      email: `gallery-vendor-${Date.now()}@example.com`,
      password: "password123",
      role: "vendor",
      vendorStatus: "approved",
    });
    const accessories = await Category.create({ name: "Accessories" });
    const homeLiving = await Category.create({ name: "Home & Living" });
    const keptUrl = "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Accessories/original-1.webp";
    const removedUrl = "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Accessories/original-2.webp";

    const product = await Product.create({
      name: "Shelf Organizer",
      price: 45,
      description: "Storage box",
      stock: 4,
      vendorId: vendor._id,
      categoryId: accessories._id,
      imageUrl: keptUrl,
      imageUrls: [keptUrl, removedUrl],
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${createToken(vendor._id)}`)
      .field("categoryId", homeLiving._id.toString())
      .field("keepImages", keptUrl)
      .attach("images", Buffer.from("fresh-image"), "new basket.webp");

    expect(response.statusCode).toBe(200);
    expect(response.body.imageUrls).toHaveLength(2);
    expect(response.body.imageUrls).toContain(keptUrl);
    expect(response.body.imageUrls[1]).toContain("/Home-Living/");
    expect(mockSupabaseState.uploads).toHaveLength(1);
    expect(mockSupabaseState.uploads[0].objectPath).toMatch(/^Home-Living\//);
    expect(mockSupabaseState.removes).toContain("Accessories/original-2.webp");
  });

  it("replaces all existing product images when none are kept and a new image is uploaded", async () => {
    const vendor = await User.create({
      name: "Replacement Vendor",
      email: `replacement-vendor-${Date.now()}@example.com`,
      password: "password123",
      role: "vendor",
      vendorStatus: "approved",
    });
    const category = await Category.create({ name: "Accessories" });
    const removedUrl = "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Accessories/original-only.webp";

    const product = await Product.create({
      name: "Travel Pouch",
      price: 35,
      description: "Compact organizer",
      stock: 6,
      vendorId: vendor._id,
      categoryId: category._id,
      imageUrl: removedUrl,
      imageUrls: [removedUrl],
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${createToken(vendor._id)}`)
      .field("removeImage", "true")
      .attach("images", Buffer.from("replacement-image"), "replacement.webp");

    expect(response.statusCode).toBe(200);
    expect(response.body.imageUrls).toHaveLength(1);
    expect(response.body.imageUrls[0]).toContain("/Accessories/");
    expect(response.body.imageUrls).not.toContain(removedUrl);
    expect(mockSupabaseState.uploads).toHaveLength(1);
    expect(mockSupabaseState.removes).toContain("Accessories/original-only.webp");
  });

  it("deletes Supabase product objects when a product is removed", async () => {
    const vendor = await User.create({
      name: "Delete Vendor",
      email: `delete-vendor-${Date.now()}@example.com`,
      password: "password123",
      role: "vendor",
      vendorStatus: "approved",
    });
    const category = await Category.create({ name: "Sports & Outdoors" });
    const imageUrlOne = "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Sports-Outdoors/item-1.webp";
    const imageUrlTwo = "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Sports-Outdoors/item-2.webp";

    const product = await Product.create({
      name: "Resistance Band",
      price: 30,
      description: "Workout gear",
      stock: 12,
      vendorId: vendor._id,
      categoryId: category._id,
      imageUrl: imageUrlOne,
      imageUrls: [imageUrlOne, imageUrlTwo],
    });

    const response = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${createToken(vendor._id)}`);

    expect(response.statusCode).toBe(200);
    expect(await Product.findById(product._id)).toBeNull();
    expect(mockSupabaseState.removes).toEqual(
      expect.arrayContaining([
        "Sports-Outdoors/item-1.webp",
        "Sports-Outdoors/item-2.webp",
      ])
    );
  });

  it("stores profile assets in user folders and deletes replaced or removed objects", async () => {
    const user = await User.create({
      name: "Profile Media User",
      email: `profile-media-${Date.now()}@example.com`,
      password: "password123",
      role: "customer",
      profileImageUrl: "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Users/seed/Profile/original.png",
      profileCardBackgroundUrl: "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Users/seed/Background/original-bg.png",
    });

    const response = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${createToken(user._id)}`)
      .field("name", "Profile Media User")
      .field("removeProfileBackground", "true")
      .attach("profileImage", Buffer.from("avatar"), "fresh avatar.png");

    expect(response.statusCode).toBe(200);
    expect(response.body.profileImageUrl).toContain(`/Users/${user._id}/Profile/`);
    expect(response.body.profileCardBackgroundUrl).toBeUndefined();
    expect(mockSupabaseState.uploads).toHaveLength(1);
    expect(mockSupabaseState.uploads[0].objectPath).toContain(`Users/${user._id}/Profile/`);
    expect(mockSupabaseState.removes).toEqual(
      expect.arrayContaining([
        "Users/seed/Profile/original.png",
        "Users/seed/Background/original-bg.png",
      ])
    );
  });
});

describe("wishlist", () => {
  it("allows a customer to add and retrieve wishlist items", async () => {
    const { customer, product } = await seedReviewFixture();

    const addResponse = await request(app)
      .post(`/api/wishlist/${product._id}`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`);

    expect(addResponse.statusCode).toBe(201);
    expect(addResponse.body.message).toBe("Added to wishlist");
    expect(addResponse.body.items).toHaveLength(1);
    expect(addResponse.body.items[0]._id).toBe(String(product._id));

    const getResponse = await request(app)
      .get("/api/wishlist")
      .set("Authorization", `Bearer ${createToken(customer._id)}`);

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.items).toHaveLength(1);
    expect(getResponse.body.items[0].name).toBe("Trail Runner");
  });

  it("allows a customer to remove wishlist items", async () => {
    const { customer, product } = await seedReviewFixture();

    await request(app)
      .post(`/api/wishlist/${product._id}`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`);

    const removeResponse = await request(app)
      .delete(`/api/wishlist/${product._id}`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`);

    expect(removeResponse.statusCode).toBe(200);
    expect(removeResponse.body.message).toBe("Removed from wishlist");
    expect(removeResponse.body.items).toHaveLength(0);
  });
});

describe("checkout", () => {
  it("creates an order with shipping details and saves checkout defaults", async () => {
    const { customer, product } = await seedReviewFixture();

    await Cart.create({
      userId: customer._id,
      items: [{ productId: product._id, quantity: 2 }],
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({
        shippingAddress: {
          fullName: "Review Author",
          phone: "555-0100",
          addressLine1: "221B Baker Street",
          addressLine2: "Floor 2",
          city: "London",
          state: "Greater London",
          postalCode: "NW1",
          country: "UK",
        },
        deliveryMethod: "express",
        paymentMethod: "card",
        orderNotes: "Leave with concierge",
        saveCheckoutProfile: true,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.subtotal).toBe(240);
    expect(response.body.shippingFee).toBeCloseTo(14.99);
    expect(response.body.totalPrice).toBeCloseTo(254.99);
    expect(response.body.paymentStatus).toBe("paid");
    expect(response.body.status).toBe("paid");
    expect(response.body.shippingAddress.fullName).toBe("Review Author");
    expect(response.body.deliveryMethod).toBe("express");
    expect(response.body.paymentMethod).toBe("card");

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(6);

    const savedCart = await Cart.findOne({ userId: customer._id });
    expect(savedCart.items).toHaveLength(0);

    const savedUser = await User.findById(customer._id);
    expect(savedUser.defaultPaymentMethod).toBe("card");
    expect(savedUser.defaultShippingAddress.fullName).toBe("Review Author");
    expect(savedUser.defaultShippingAddress.city).toBe("London");
    expect(savedUser.phone).toBe("555-0100");
    expect(savedUser.address).toContain("221B Baker Street");
  });

  it("rejects checkout when required shipping fields are missing", async () => {
    const { customer, product } = await seedReviewFixture();

    await Cart.create({
      userId: customer._id,
      items: [{ productId: product._id, quantity: 1 }],
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({
        shippingAddress: {
          fullName: "Review Author",
          phone: "",
          addressLine1: "",
          city: "London",
          state: "",
          postalCode: "",
          country: "UK",
        },
        deliveryMethod: "standard",
        paymentMethod: "cod",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe("INVALID_CHECKOUT_DETAILS");
    expect(await Order.countDocuments()).toBe(0);
  });
});

describe("registration and approval", () => {
  it("registers a vendor with pending approval and default checkout details", async () => {
    const email = `vendor-register-${Date.now()}@example.com`;

    const response = await request(app)
      .post("/api/users/register")
      .send({
        name: "Fresh Vendor",
        email,
        password: "Vendor1!",
        confirmPassword: "Vendor1!",
        role: "vendor",
        shopName: "Fresh Finds",
        phone: "555-0200",
        address: "42 Market Street",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.role).toBe("vendor");
    expect(response.body.vendorStatus).toBe("pending");

    const storedUser = await User.findOne({ email });
    expect(storedUser.shopName).toBe("Fresh Finds");
    expect(storedUser.defaultPaymentMethod).toBe("cod");
    expect(storedUser.defaultShippingAddress.fullName).toBe("Fresh Vendor");
    expect(storedUser.defaultShippingAddress.phone).toBe("555-0200");
    expect(storedUser.defaultShippingAddress.addressLine1).toBe("42 Market Street");
  });

  it("blocks a pending vendor from logging in before approval", async () => {
    const email = `pending-vendor-${Date.now()}@example.com`;

    await request(app)
      .post("/api/users/register")
      .send({
        name: "Pending Vendor",
        email,
        password: "Vendor1!",
        confirmPassword: "Vendor1!",
        role: "vendor",
        shopName: "Pending Store",
      });

    const response = await request(app)
      .post("/api/users/login")
      .send({ email, password: "Vendor1!" });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toContain("pending admin approval");
  });
});

describe("authorization rules", () => {
  it("rejects wishlist access without a bearer token", async () => {
    const response = await request(app).get("/api/wishlist");

    expect(response.statusCode).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("prevents admins from banning themselves or another admin account", async () => {
    const primaryAdmin = await User.create({
      name: "Primary Admin",
      email: `primary-admin-${Date.now()}@example.com`,
      password: "password123",
      role: "admin",
    });
    const secondaryAdmin = await User.create({
      name: "Secondary Admin",
      email: `secondary-admin-${Date.now()}@example.com`,
      password: "password123",
      role: "admin",
    });

    const selfBanResponse = await request(app)
      .put(`/api/users/${primaryAdmin._id}/ban`)
      .set("Authorization", `Bearer ${createToken(primaryAdmin._id)}`)
      .send({ isBanned: true });

    expect(selfBanResponse.statusCode).toBe(400);
    expect(selfBanResponse.body.message).toContain("cannot ban your own account");

    const adminBanResponse = await request(app)
      .put(`/api/users/${secondaryAdmin._id}/ban`)
      .set("Authorization", `Bearer ${createToken(primaryAdmin._id)}`)
      .send({ isBanned: true });

    expect(adminBanResponse.statusCode).toBe(403);
    expect(adminBanResponse.body.message).toContain("cannot be banned");
  });
});

describe("order lifecycle", () => {
  it("allows a customer to cancel a pending order", async () => {
    const { customer, product } = await seedReviewFixture();

    await Cart.create({
      userId: customer._id,
      items: [{ productId: product._id, quantity: 1 }],
    });

    const createResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({
        shippingAddress: buildShippingAddress({ fullName: "Cancel Customer" }),
        deliveryMethod: "standard",
        paymentMethod: "cod",
      });

    expect(createResponse.statusCode).toBe(201);

    const cancelResponse = await request(app)
      .put(`/api/orders/${createResponse.body._id}/cancel`)
      .set("Authorization", `Bearer ${createToken(customer._id)}`);

    expect(cancelResponse.statusCode).toBe(200);
    expect(cancelResponse.body.order.status).toBe("cancelled");
    expect(cancelResponse.body.order.cancelledBy).toBe("customer");
    expect(cancelResponse.body.order.items[0].fulfillmentStatus).toBe("cancelled");
  });

  it("allows a vendor to update owned order items and view updated sales summary", async () => {
    const { vendor, customer, product } = await seedReviewFixture();

    await Cart.create({
      userId: customer._id,
      items: [{ productId: product._id, quantity: 1 }],
    });

    const orderResponse = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({
        shippingAddress: buildShippingAddress({ fullName: "Vendor Order Customer" }),
        deliveryMethod: "express",
        paymentMethod: "card",
      });

    expect(orderResponse.statusCode).toBe(201);

    const statusResponse = await request(app)
      .put(`/api/orders/vendor/${orderResponse.body._id}/status`)
      .set("Authorization", `Bearer ${createToken(vendor._id)}`)
      .send({ status: "shipped" });

    expect(statusResponse.statusCode).toBe(200);
    expect(statusResponse.body.order.status).toBe("shipped");
    expect(statusResponse.body.order.items[0].fulfillmentStatus).toBe("shipped");

    const statsResponse = await request(app)
      .get("/api/orders/vendor/stats")
      .set("Authorization", `Bearer ${createToken(vendor._id)}`);

    expect(statsResponse.statusCode).toBe(200);
    expect(statsResponse.body.totalRevenue).toBe(120);
    expect(statsResponse.body.totalItemsSold).toBe(1);
    expect(statsResponse.body.totalOrders).toBe(1);
  });

  it("rejects checkout when the customer cart is empty", async () => {
    const customer = await User.create({
      name: "Empty Cart Customer",
      email: `empty-cart-${Date.now()}@example.com`,
      password: "password123",
      role: "customer",
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${createToken(customer._id)}`)
      .send({
        shippingAddress: buildShippingAddress({ fullName: "Empty Cart Customer" }),
        deliveryMethod: "standard",
        paymentMethod: "cod",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.code).toBe("EMPTY_CART");
  });
});
