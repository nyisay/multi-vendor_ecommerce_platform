import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Footer from "./Footer";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded px-3 py-2 text-sm font-medium ${isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-gray-900">
            Multi Vendor Ecommerce
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavItem to="/products">Products</NavItem>
            {isAuthenticated && <NavItem to="/profile">Profile</NavItem>}

            {user?.role === "customer" && <NavItem to="/cart">Cart</NavItem>}
            {user?.role === "customer" && <NavItem to="/orders">My Orders</NavItem>}
            {user?.role === "vendor" && <NavItem to="/vendor/dashboard">Vendor Panel</NavItem>}
            {user?.role === "admin" && <NavItem to="/admin/dashboard">Admin Panel</NavItem>}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                  {user?.role}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded bg-gray-900 px-3 py-2 text-sm font-semibold text-white">
                  Login
                </Link>
                <Link to="/register" className="rounded border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t bg-white p-3 md:hidden">
            <div className="space-y-2">
              <NavLink onClick={closeMobile} to="/products" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                Products
              </NavLink>
              {isAuthenticated && (
                <NavLink onClick={closeMobile} to="/profile" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Profile
                </NavLink>
              )}
              {user?.role === "customer" && (
                <>
                  <NavLink onClick={closeMobile} to="/cart" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    Cart
                  </NavLink>
                  <NavLink onClick={closeMobile} to="/orders" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                    My Orders
                  </NavLink>
                </>
              )}
              {user?.role === "vendor" && (
                <NavLink onClick={closeMobile} to="/vendor/dashboard" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Vendor Panel
                </NavLink>
              )}
              {user?.role === "admin" && (
                <NavLink onClick={closeMobile} to="/admin/dashboard" className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Admin Panel
                </NavLink>
              )}
            </div>
            <div className="mt-3 border-t pt-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  className="w-full rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link onClick={closeMobile} to="/login" className="rounded bg-gray-900 px-3 py-2 text-center text-sm font-semibold text-white">
                    Login
                  </Link>
                  <Link onClick={closeMobile} to="/register" className="rounded border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
