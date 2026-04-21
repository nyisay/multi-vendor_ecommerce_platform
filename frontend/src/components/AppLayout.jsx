import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PRODUCT_MENU_GROUPS } from "../data/productMegaMenu";
import Footer from "./Footer";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${
          isActive ? "bg-[#91ADC2] text-white" : "text-gray-800 hover:bg-white/60"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#A9DDD6] text-gray-900">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-[#A9DDD6]/70 backdrop-blur">
        <div className="border-b border-gray-100">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2 text-xs text-gray-600">
            <p className="hidden sm:block">Shop across trusted sellers</p>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-800">
                    {user?.role}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-100">
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-[#91ADC2] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#9BA0BC]"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center px-4 py-3 md:grid-cols-[1fr_auto_1fr]">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-sm font-black text-white">
              X
            </span>
            <span className="text-sm font-mono tracking-tight text-gray-900 sm:text-base">
              Matrix
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-1 md:flex">
            <div
              className="relative"
              onMouseEnter={() => setProductsMenuOpen(true)}
              onMouseLeave={() => setProductsMenuOpen(false)}
              onFocus={() => setProductsMenuOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setProductsMenuOpen(false);
                }
              }}
            >
              <NavItem to="/products">Products</NavItem>
              <div
                className={`absolute left-1/2 top-full z-50 w-[min(92vw,900px)] -translate-x-1/2 pt-3 transition-all duration-200 ${
                  productsMenuOpen ? "visible opacity-100" : "invisible opacity-0"
                }`}
              >
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Shop by category
                    </p>
                    <Link
                      to="/products"
                      className="text-xs font-semibold text-gray-700 transition hover:text-gray-900"
                    >
                      View all products
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {PRODUCT_MENU_GROUPS.map((group) => (
                      <div key={group.title} className="rounded-2xl bg-gray-50 p-4">
                        <Link
                          to={`/products?q=${encodeURIComponent(group.title)}`}
                          className="text-sm font-extrabold tracking-tight text-gray-900 hover:underline"
                        >
                          {group.title}
                        </Link>
                        <div className="mt-3 flex flex-col gap-2">
                          {group.items.map((item) => (
                            <Link
                              key={item}
                              to={`/products?q=${encodeURIComponent(item)}`}
                              className="text-xs font-semibold text-gray-600 transition hover:text-gray-900"
                            >
                              {item}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {isAuthenticated && <NavItem to="/profile">Account</NavItem>}
            {user?.role === "customer" && <NavItem to="/cart">Cart</NavItem>}
            {user?.role === "customer" && <NavItem to="/orders">Orders</NavItem>}
            {user?.role === "vendor" && <NavItem to="/vendor/dashboard">Vendor</NavItem>}
            {user?.role === "admin" && <NavItem to="/admin/dashboard">Admin</NavItem>}
          </nav>

          <div className="flex justify-end">
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-white/60 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              Menu
            </button>
          </div>
        </div>

        <div
          className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}
          aria-hidden={!mobileOpen}
        >
          <div className="border-t border-white/60 bg-[#A9DDD6]">
            <div className="mx-auto w-full max-w-7xl px-4 py-4">
              <div className="grid gap-2">
                <NavLink
                  onClick={closeMobile}
                  to="/products"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Products
                </NavLink>
                {isAuthenticated && (
                  <NavLink
                    onClick={closeMobile}
                    to="/profile"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    Account
                  </NavLink>
                )}
                {user?.role === "customer" && (
                  <>
                    <NavLink
                      onClick={closeMobile}
                      to="/cart"
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                    >
                      Cart
                    </NavLink>
                    <NavLink
                      onClick={closeMobile}
                      to="/orders"
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                    >
                      Orders
                    </NavLink>
                  </>
                )}
                {user?.role === "vendor" && (
                  <NavLink
                    onClick={closeMobile}
                    to="/vendor/dashboard"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    Vendor Panel
                  </NavLink>
                )}
                {user?.role === "admin" && (
                  <NavLink
                    onClick={closeMobile}
                    to="/admin/dashboard"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    Admin Panel
                  </NavLink>
                )}
              </div>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  className="mt-4 w-full rounded-xl bg-[#9BA0BC] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#7A8B99]"
                >
                  Logout
                </button>
              )}
              {!isAuthenticated && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    onClick={closeMobile}
                    to="/login"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    onClick={closeMobile}
                    to="/register"
                    className="rounded-xl bg-[#91ADC2] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#9BA0BC]"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
