import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PRODUCT_MENU_GROUPS } from "../data/productMegaMenu";
import BrandLogo from "./BrandLogo";
import Footer from "./Footer";

const MENU_SURFACES = [
  "border-amber-200 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)] text-amber-950",
  "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)] text-sky-950",
  "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)] text-emerald-950",
  "border-rose-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] text-rose-950",
  "border-violet-200 bg-[linear-gradient(180deg,_#f5f3ff_0%,_#ffffff_100%)] text-violet-950",
  "border-orange-200 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)] text-orange-950",
];

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-4 py-2.5 text-sm font-semibold tracking-tight transition ${
          isActive
            ? "!bg-amber-200 text-slate-950 shadow-[0_14px_30px_-18px_rgba(251,191,36,0.85)]"
            : "!text-white hover:bg-white/10 hover:text-green-500"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function SearchForm({
  initialValue,
  onSubmit,
  wrapperClassName,
  containerClassName,
  inputClassName,
  buttonClassName,
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
      className={wrapperClassName}
    >
      <div className={containerClassName}>
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products..."
          className={inputClassName}
        />
        <button type="submit" className={buttonClassName}>
          Search
        </button>
      </div>
    </form>
  );
}

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const closeProductsMenu = () => setProductsMenuOpen(false);
  const routeSearchQuery = location.pathname.startsWith("/products")
    ? new URLSearchParams(location.search).get("q") || ""
    : "";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    let title = "PawsieMart";
    let description = "Whisker-approved marketplace for curated finds and everyday shopping.";

    if (location.pathname === "/") {
      title = "PawsieMart | Home";
      description =
        "Browse curated products from multiple vendors in one cozy, cat-inspired marketplace.";
    } else if (location.pathname === "/products") {
      title = query ? `${query} | Products | PawsieMart` : "Products | PawsieMart";
      description = "Search, filter, sort, and browse products across PawsieMart.";
    } else if (location.pathname.startsWith("/products/")) {
      title = "Product Details | PawsieMart";
      description = "View product details, reviews, pricing, and purchase options.";
    } else if (location.pathname === "/cart") {
      title = "Your Cart | PawsieMart";
      description = "Review selected items and continue to checkout.";
    } else if (location.pathname === "/checkout") {
      title = "Checkout | PawsieMart";
      description = "Confirm shipping details, payment method, and place your order.";
    } else if (location.pathname === "/orders") {
      title = "Orders | PawsieMart";
      description = "Track, review, and manage your orders.";
    } else if (location.pathname === "/wishlist") {
      title = "Wishlist | PawsieMart";
      description = "Saved products you want to revisit later.";
    } else if (location.pathname === "/profile") {
      title = "Profile | PawsieMart";
      description = "Manage your account details and shopping preferences.";
    } else if (location.pathname.startsWith("/vendor/")) {
      title = "Vendor Workspace | PawsieMart";
      description = "Manage products, orders, and storefront activity.";
    } else if (location.pathname.startsWith("/admin/")) {
      title = "Admin Dashboard | PawsieMart";
      description = "Review marketplace activity, users, products, and orders.";
    } else if (location.pathname === "/login") {
      title = "Sign In | PawsieMart";
      description = "Access your PawsieMart account.";
    } else if (location.pathname === "/register") {
      title = "Create Account | PawsieMart";
      description = "Register as a customer or apply as a vendor.";
    } else if (location.pathname === "/about") {
      title = "About | PawsieMart";
      description = "Learn more about the PawsieMart marketplace.";
    } else if (location.pathname === "/privacy") {
      title = "Privacy | PawsieMart";
      description = "Review the marketplace privacy policy.";
    } else if (location.pathname === "/terms") {
      title = "Terms | PawsieMart";
      description = "Read the marketplace terms and conditions.";
    } else if (location.pathname === "/accessibility") {
      title = "Accessibility | PawsieMart";
      description = "Accessibility information for the PawsieMart website.";
    }

    document.title = title;

    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.setAttribute("name", "description");
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute("content", description);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (value) => {
    const query = value.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    closeMobile();
  };

  return (
    <div className="min-h-screen !bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_12%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_38%,_#f8fafc_100%)] text-slate-900">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl">
        <div className="border-0 border-slate-800 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),transparent_100%)] text-white shadow-[0_22px_60px_-44px_rgba(15,23,42,0.9)]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 text-xs">
            <p className="hidden font-semibold tracking-[0.02em] text-slate-950 sm:block">
              Curated shopping for everyday finds with a little cat-loving charm
            </p>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="rounded-full border-2 !border-lime-500 bg-lime-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-800 backdrop-blur">
                    {user?.role}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full border border-white/10 !bg-gray-800 px-3 py-1.5 text-[11px] font-semibold text-white/85 transition hover:bg-white/15 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-slate-200 bg-gray-800 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full border border-amber-200 bg-amber-300 px-3 py-1.5 text-[11px] font-semibold !text-slate-950 transition hover:bg-amber-200"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98)_0%,_rgba(2,6,23,0.96)_100%)] shadow-[0_18px_44px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-[1fr_auto] items-center px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:px-5">
              <Link to="/" aria-label="PawsieMart home">
                <BrandLogo
                  nameClassName="text-lg text-white"
                  taglineClassName="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:block"
                  tagline="Curated marketplace"
                />
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
                    className={`absolute left-1/2 top-full z-50 w-[min(76vw,780px)] -translate-x-1/2 pt-3 transition-all duration-200 ${
                      productsMenuOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden rounded-[1.3rem] border border-slate-200 bg-white shadow-[0_22px_55px_-38px_rgba(15,23,42,0.3)]">
                      <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              Shop by category
                            </p>
                            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">
                              Browse products
                            </h2>
                          </div>
                          <Link
                            to="/products"
                            onClick={closeProductsMenu}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                          >
                            View all products
                          </Link>
                        </div>
                      </div>

                      <div className="max-h-[26rem] overflow-y-auto p-3 pr-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {PRODUCT_MENU_GROUPS.map((group, index) => (
                            <article
                              key={group.title}
                              className={`rounded-[1rem] border p-3 shadow-[0_14px_30px_-32px_rgba(15,23,42,0.22)] transition hover:border-slate-300 hover:bg-white ${MENU_SURFACES[index % MENU_SURFACES.length]}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <Link
                                    to={`/products?q=${encodeURIComponent(group.title)}`}
                                    onClick={closeProductsMenu}
                                    className="block text-sm font-black tracking-tight transition hover:opacity-80"
                                  >
                                    {group.title}
                                  </Link>
                                </div>
                                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900">
                                  {group.items.length}
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {group.items.map((item) => (
                                  <Link
                                    key={item}
                                    to={`/products?q=${encodeURIComponent(item)}`}
                                    onClick={closeProductsMenu}
                                    className="rounded-full border border-black/8 bg-white/75 px-2.5 py-1 text-[10px] font-semibold transition hover:bg-white"
                                  >
                                    {item}
                                  </Link>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {isAuthenticated && <NavItem to="/profile">Account</NavItem>}
                {user?.role === "customer" && <NavItem to="/cart">Cart</NavItem>}
                {user?.role === "customer" && <NavItem to="/wishlist">Wishlist</NavItem>}
                {user?.role === "customer" && <NavItem to="/orders">Orders</NavItem>}
                {user?.role === "vendor" && <NavItem to="/vendor/dashboard">Vendor</NavItem>}
                {user?.role === "admin" && <NavItem to="/admin/dashboard">Admin</NavItem>}
              </nav>

              <div className="flex items-center justify-end gap-3">
                <SearchForm
                  key={`desktop:${location.pathname}:${location.search}`}
                  initialValue={routeSearchQuery}
                  onSubmit={handleSearchSubmit}
                  wrapperClassName="hidden w-full max-w-[19rem] md:flex md:items-center md:justify-end"
                  containerClassName="flex w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-1.5 py-1.5 shadow-[0_16px_38px_-32px_rgba(15,23,42,0.55)] transition focus-within:border-amber-200 focus-within:bg-white/12"
                  inputClassName="min-w-0 flex-1 bg-transparent px-2.5 text-sm font-medium text-white outline-none placeholder:text-slate-400"
                  buttonClassName="rounded-full bg-amber-300 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-200"
                />

                <button
                  type="button"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:border-amber-200 hover:bg-white/12 md:hidden"
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
              <div className="border-t border-white/10 bg-[linear-gradient(180deg,_#111827_0%,_#020617_100%)]">
                <div className="mx-auto w-full max-w-7xl px-4 py-4">
                  <SearchForm
                    key={`mobile:${location.pathname}:${location.search}`}
                    initialValue={routeSearchQuery}
                    onSubmit={handleSearchSubmit}
                    wrapperClassName="mb-4 md:hidden"
                    containerClassName="flex items-center gap-2 rounded-[1rem] border border-white/10 bg-white/8 p-2 shadow-sm"
                    inputClassName="min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-white outline-none placeholder:text-slate-400"
                    buttonClassName="rounded-[0.85rem] bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                  />

                  <div className="grid gap-2">
                    <NavLink
                      onClick={closeMobile}
                      to="/products"
                      className="rounded-[1rem] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Products
                    </NavLink>
                    {isAuthenticated && (
                      <NavLink
                        onClick={closeMobile}
                        to="/profile"
                        className="rounded-[1rem] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                      >
                        Account
                      </NavLink>
                    )}
                    {user?.role === "customer" && (
                      <>
                        <NavLink
                          onClick={closeMobile}
                          to="/cart"
                          className="rounded-[1rem] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                        >
                          Cart
                        </NavLink>
                        <NavLink
                          onClick={closeMobile}
                          to="/wishlist"
                          className="rounded-[1rem] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                        >
                          Wishlist
                        </NavLink>
                        <NavLink
                          onClick={closeMobile}
                          to="/orders"
                          className="rounded-[1rem] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                        >
                          Orders
                        </NavLink>
                      </>
                    )}
                    {user?.role === "vendor" && (
                      <NavLink
                        onClick={closeMobile}
                        to="/vendor/dashboard"
                        className="rounded-[1rem] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                      >
                        Vendor Panel
                      </NavLink>
                    )}
                    {user?.role === "admin" && (
                      <NavLink
                        onClick={closeMobile}
                        to="/admin/dashboard"
                        className="rounded-[1rem] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
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
                      className="mt-4 w-full rounded-[1rem] bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                    >
                      Logout
                    </button>
                  )}
                  {!isAuthenticated && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        onClick={closeMobile}
                        to="/login"
                        className="rounded-[1rem] border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Sign in
                      </Link>
                      <Link
                        onClick={closeMobile}
                        to="/register"
                        className="rounded-[1rem] bg-amber-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
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
