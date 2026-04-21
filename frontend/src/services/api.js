import axios from "axios";

export const TOKEN_KEY = "mve_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const ASSET_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${ASSET_BASE_URL}${imagePath}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Request failed";
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.code = error.response?.data?.code;
    normalizedError.details = error.response?.data?.details;
    return Promise.reject(normalizedError);
  },
);

export const authApi = {
  register(payload) {
    return api.post("/users/register", payload).then((res) => res.data);
  },
  login(payload) {
    return api.post("/users/login", payload).then((res) => res.data);
  },
  getProfile() {
    return api.get("/users/profile").then((res) => res.data);
  },
  updateProfile(payload) {
    return api
      .put("/users/profile", payload, payload instanceof FormData ? {} : undefined)
      .then((res) => res.data);
  },
};

export const productApi = {
  getAll(params = {}) {
    return api.get("/products", { params }).then((res) => res.data);
  },
  getById(productId) {
    return api.get(`/products/${productId}`).then((res) => res.data);
  },
  getMine() {
    return api.get("/products/my-products").then((res) => res.data);
  },
  getByVendor(vendorId) {
    return api.get(`/products/vendor/${vendorId}`).then((res) => res.data);
  },
  create(payload) {
    return api.post("/products", payload).then((res) => res.data);
  },
  createWithImage(payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    return api.post("/products", formData).then((res) => res.data);
  },
  update(productId, payload) {
    return api.put(`/products/${productId}`, payload).then((res) => res.data);
  },
  updateWithImage(productId, payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    return api.put(`/products/${productId}`, formData).then((res) => res.data);
  },
  remove(productId) {
    return api.delete(`/products/${productId}`).then((res) => res.data);
  },
  addReview(productId, payload) {
    return api.post(`/products/${productId}/reviews`, payload).then((res) => res.data);
  },
  getAllForAdmin() {
    return api.get("/products/admin/all").then((res) => res.data);
  },
  adminUpdate(productId, payload) {
    return api.put(`/products/admin/${productId}`, payload).then((res) => res.data);
  },
  adminDelete(productId) {
    return api.delete(`/products/admin/${productId}`).then((res) => res.data);
  },
};

export const categoryApi = {
  getAll() {
    return api.get("/categories").then((res) => res.data);
  },
  create(name) {
    return api.post("/categories", { name }).then((res) => res.data);
  },
};

export const cartApi = {
  get() {
    return api.get("/cart").then((res) => res.data);
  },
  add(productId, quantity) {
    return api.post("/cart", { productId, quantity }).then((res) => res.data);
  },
  updateQuantity(productId, quantity) {
    return api.put(`/cart/${productId}`, { quantity }).then((res) => res.data);
  },
  remove(productId) {
    return api.delete(`/cart/${productId}`).then((res) => res.data);
  },
};

export const orderApi = {
  create() {
    return api.post("/orders").then((res) => res.data);
  },
  getMine() {
    return api.get("/orders").then((res) => res.data);
  },
  cancel(orderId) {
    return api.put(`/orders/${orderId}/cancel`).then((res) => res.data);
  },
  getVendorOrders() {
    return api.get("/orders/vendor").then((res) => res.data);
  },
  updateVendorOrderStatus(orderId, status) {
    return api.put(`/orders/vendor/${orderId}/status`, { status }).then((res) => res.data);
  },
  getVendorStats() {
    return api.get("/orders/vendor/stats").then((res) => res.data);
  },
  getAllAdmin() {
    return api.get("/orders/admin/all").then((res) => res.data);
  },
  updateAdminOrderStatus(orderId, payload) {
    return api.put(`/orders/admin/${orderId}/status`, payload).then((res) => res.data);
  },
  getAdminAnalytics() {
    return api.get("/orders/admin/analytics").then((res) => res.data);
  },
};

export const adminApi = {
  getUsers() {
    return api.get("/users").then((res) => res.data);
  },
  getVendors(status = "") {
    return api
      .get("/users/vendors", { params: status ? { status } : {} })
      .then((res) => res.data);
  },
  updateVendorStatus(vendorId, status) {
    return api.put(`/users/vendors/${vendorId}/status`, { status }).then((res) => res.data);
  },
};
