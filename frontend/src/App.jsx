import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminMarketingDashboardPage from "./pages/AdminMarketingDashboardPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminStrategicDashboardPage from "./pages/AdminStrategicDashboardPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminVendorsPage from "./pages/AdminVendorsPage";
import AboutPage from "./pages/AboutPage";
import AccessibilityPage from "./pages/AccessibilityPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductsPage from "./pages/ProductsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RegisterPage from "./pages/RegisterPage";
import TermsPage from "./pages/TermsPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import VendorOrdersPage from "./pages/VendorOrdersPage";
import VendorOperationalDashboardPage from "./pages/VendorOperationalDashboardPage";
import VendorProductsPage from "./pages/VendorProductsPage";
import WishlistPage from "./pages/WishlistPage";

function RoleHomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/products" replace />;
  }

  if (user.role === "vendor") {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/products" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="accessibility" element={<AccessibilityPage />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="cart"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="checkout"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="wishlist"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="vendor/products"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="vendor/operational-dashboard"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorOperationalDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="vendor/orders"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/strategic-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminStrategicDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/marketing-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMarketingDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/vendors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminVendorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route path="dashboard" element={<RoleHomeRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
