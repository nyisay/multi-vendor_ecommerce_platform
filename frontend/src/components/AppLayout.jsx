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
        `rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition ${
          isActive
            ? "bg-blue-700 text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/80 bg-slate-50/75">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2 text-xs">
            <p className="hidden font-semibold text-slate-500 sm:block">
              Trusted multi-vendor marketplace for everyday shopping
            </p>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-blue-700">
                    {user?.role}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-blue-700 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-800"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center px-4 py-4 md:grid-cols-[1fr_auto_1fr]">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
              MV
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">MultiVendor</span>
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
                className={`absolute left-1/2 top-full z-50 w-[min(92vw,920px)] -translate-x-1/2 pt-3 transition-all duration-200 ${
                  productsMenuOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0"
                }`}
              >
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-26px_rgba(15,23,42,0.35)]">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      Shop by category
                    </p>
                    <Link
                      to="/products"
                      className="text-xs font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      View all products
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {PRODUCT_MENU_GROUPS.map((group) => (
                      <div
                        key={group.title}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
                      >
                        <Link
                          to={`/products?q=${encodeURIComponent(group.title)}`}
                          className="text-sm font-extrabold tracking-tight text-slate-900 hover:text-blue-700"
                        >
                          {group.title}
                        </Link>
                        <div className="mt-3 flex flex-col gap-2">
                          {group.items.map((item) => (
                            <Link
                              key={item}
                              to={`/products?q=${encodeURIComponent(item)}`}
                              className="text-xs font-semibold text-slate-600 transition hover:text-slate-900"
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
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              Menu
            </button>
          </div>
        </div>

        <div className={`md:hidden ${mobileOpen ? "block" : "hidden"}`} aria-hidden={!mobileOpen}>
          <div className="border-t border-slate-200 bg-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-4">
              <div className="grid gap-2">
                <NavLink
                  onClick={closeMobile}
                  to="/products"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Products
                </NavLink>
                {isAuthenticated && (
                  <NavLink
                    onClick={closeMobile}
                    to="/profile"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Account
                  </NavLink>
                )}
                {user?.role === "customer" && (
                  <>
                    <NavLink
                      onClick={closeMobile}
                      to="/cart"
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      Cart
                    </NavLink>
                    <NavLink
                      onClick={closeMobile}
                      to="/orders"
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      Orders
                    </NavLink>
                  </>
                )}
                {user?.role === "vendor" && (
                  <NavLink
                    onClick={closeMobile}
                    to="/vendor/dashboard"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Vendor Panel
                  </NavLink>
                )}
                {user?.role === "admin" && (
                  <NavLink
                    onClick={closeMobile}
                    to="/admin/dashboard"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
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
                  className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Logout
                </button>
              )}
              {!isAuthenticated && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    onClick={closeMobile}
                    to="/login"
                    className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Sign in
                  </Link>
                  <Link
                    onClick={closeMobile}
                    to="/register"
                    className="rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 lg:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
