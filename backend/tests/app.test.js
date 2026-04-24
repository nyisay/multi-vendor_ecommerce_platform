const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const { app } = require("../server");
const User = require("../models/User");
const Category = require("../models/Category");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

let mongoServer;

const createToken = (userId) => jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET);

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
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  await mongoose.connect(mongoServer.getUri());
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
