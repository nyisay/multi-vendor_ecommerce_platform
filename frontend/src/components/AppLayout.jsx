import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PRODUCT_MENU_GROUPS } from "../data/productMegaMenu";
import Footer from "./Footer";

const MENU_SURFACES = [
  "bg-amber-50 text-amber-950 ring-amber-200",
  "bg-sky-50 text-sky-950 ring-sky-200",
  "bg-emerald-50 text-emerald-950 ring-emerald-200",
  "bg-rose-50 text-rose-950 ring-rose-200",
  "bg-violet-50 text-violet-950 ring-violet-200",
  "bg-orange-50 text-orange-950 ring-orange-200",
];

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2.5 text-sm font-semibold tracking-tight transition ${
          isActive
            ? "bg-amber-300 text-slate-950 shadow-[0_14px_30px_-18px_rgba(251,191,36,0.85)]"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_18%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_38%,_#f8fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl">
        <div className="border-0 border-slate-800 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),transparent_100%)] text-white shadow-[0_22px_60px_-44px_rgba(15,23,42,0.9)]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 text-xs">
            <p className="hidden font-semibold tracking-[0.02em] text-black sm:block">
              Trusted multi-vendor marketplace for everyday shopping
            </p>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
                    {user?.role}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/85 transition hover:bg-white/15 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-gray-300 bg-gray-600 px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-gray-900 hover:text-black"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full border border-gray-500 bg-yellow-300 px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-amber-300 hover:text-black"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white/95 shadow-[0_18px_44px_-40px_rgba(15,23,42,0.22)] backdrop-blur">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-[1fr_auto] items-center px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:px-5">
              <Link to="/" className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-slate-950 text-sm font-black text-white shadow-[0_18px_35px_-20px_rgba(15,23,42,0.8)]">
                  MV
                </span>
                <div>
                  <p className="text-lg font-black tracking-[-0.03em] text-slate-950">
                    MultiVendor
                  </p>
                  <p className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
                    Curated marketplace
                  </p>
                </div>
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
                    className={`absolute left-1/2 top-full z-50 w-[min(92vw,960px)] -translate-x-1/2 pt-0 transition-all duration-200 ${
                      productsMenuOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden border border-slate-200 bg-white shadow-[0_28px_70px_-34px_rgba(15,23,42,0.32)]">
                      <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                              Shop by category
                            </p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                              Browse discovery lanes, not clutter
                            </h2>
                          </div>
                          <Link
                            to="/products"
                            className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            View all products
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-6 xl:grid-cols-3">
                        {PRODUCT_MENU_GROUPS.map((group, index) => (
                          <div
                            key={group.title}
                            className={`px-4 py-4 ring-1 ${
                              MENU_SURFACES[index % MENU_SURFACES.length]
                            }`}
                          >
                            <Link
                              to={`/products?q=${encodeURIComponent(group.title)}`}
                              className="text-base font-black tracking-tight transition hover:opacity-80"
                            >
                              {group.title}
                            </Link>
                            <div className="mt-4 flex flex-col gap-2">
                              {group.items.map((item) => (
                                <Link
                                  key={item}
                                  to={`/products?q=${encodeURIComponent(item)}`}
                                  className="text-xs font-semibold opacity-80 transition hover:opacity-100"
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

            <div
              className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}
              aria-hidden={!mobileOpen}
            >
              <div className="border-t border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]">
                <div className="mx-auto w-full max-w-7xl px-4 py-4">
                  <div className="grid gap-2">
                    <NavLink
                      onClick={closeMobile}
                      to="/products"
                      className="px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      Products
                    </NavLink>
                    {isAuthenticated && (
                      <NavLink
                        onClick={closeMobile}
                        to="/profile"
                        className="px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        Account
                      </NavLink>
                    )}
                    {user?.role === "customer" && (
                      <>
                        <NavLink
                          onClick={closeMobile}
                          to="/cart"
                          className="px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          Cart
                        </NavLink>
                        <NavLink
                          onClick={closeMobile}
                          to="/orders"
                          className="px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          Orders
                        </NavLink>
                      </>
                    )}
                    {user?.role === "vendor" && (
                      <NavLink
                        onClick={closeMobile}
                        to="/vendor/dashboard"
                        className="px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        Vendor Panel
                      </NavLink>
                    )}
                    {user?.role === "admin" && (
                      <NavLink
                        onClick={closeMobile}
                        to="/admin/dashboard"
                        className="px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
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
                      className="mt-4 w-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  )}
                  {!isAuthenticated && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        onClick={closeMobile}
                        to="/login"
                        className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        Sign in
                      </Link>
                      <Link
                        onClick={closeMobile}
                        to="/register"
                        className="bg-amber-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                      >
                        Create account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
