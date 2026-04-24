import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PRODUCT_MENU_GROUPS } from "../data/productMegaMenu";
import { getImageUrl, productApi } from "../services/api";
import { getRecentlyViewedProducts } from "../services/recentlyViewed";

const CATEGORY_SURFACES = [
  "bg-amber-100 text-amber-950 ring-amber-200",
  "bg-sky-100 text-sky-950 ring-sky-200",
  "bg-emerald-100 text-emerald-950 ring-emerald-200",
  "bg-rose-100 text-rose-950 ring-rose-200",
  "bg-violet-100 text-violet-950 ring-violet-200",
  "bg-orange-100 text-orange-950 ring-orange-200",
  "bg-cyan-100 text-cyan-950 ring-cyan-200",
  "bg-lime-100 text-lime-950 ring-lime-200",
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewedProducts());

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const data = await productApi.getAll();
        if (!cancelled) {
          setProducts(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncRecentlyViewed = () => {
      setRecentlyViewed(getRecentlyViewedProducts());
    };

    window.addEventListener("focus", syncRecentlyViewed);
    window.addEventListener("storage", syncRecentlyViewed);

    return () => {
      window.removeEventListener("focus", syncRecentlyViewed);
      window.removeEventListener("storage", syncRecentlyViewed);
    };
  }, []);

  const derivedCategories = useMemo(() => {
    const categorySet = new Set(
      products.map((item) => item.categoryId?.name).filter(Boolean),
    );
    const categories = Array.from(categorySet);
    return categories.length > 0
      ? categories.slice(0, 8)
      : PRODUCT_MENU_GROUPS.map((group) => group.title).slice(0, 8);
  }, [products]);

  const featuredProducts = useMemo(() => {
    if (!products.length) {
      return [];
    }
    return products.slice(0, 6);
  }, [products]);

  const trustHighlights = useMemo(() => {
    const uniqueVendors = new Set(
      products.map((item) => item.vendorId?._id).filter(Boolean),
    ).size;
    const uniqueCategories = new Set(
      products.map((item) => item.categoryId?._id).filter(Boolean),
    ).size;

    return [
      { label: "Active products", value: String(products.length || 0) },
      { label: "Verified suppliers", value: String(uniqueVendors || 0) },
      { label: "Categories", value: String(uniqueCategories || 0) },
      { label: "Marketplace channels", value: "Customer, Vendor, Admin" },
    ];
  }, [products]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  };

  const popularSearches = ["headphones", "packaging", "bottle", "ring light"];

  return (
    <div className="space-y-8 pb-4 md:space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_85%_20%,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#111827_52%,_#1f2937_100%)] text-white shadow-[0_36px_100px_-48px_rgba(15,23,42,0.95)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[-12%] h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute right-[-6%] top-[8%] h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
          <div className="absolute bottom-[-18%] left-[36%] h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="relative grid gap-8 px-6 py-8 sm:px-8 sm:py-10 md:grid-cols-12 md:px-10 md:py-12">
          <div className="space-y-7 md:col-span-7">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-white/80 backdrop-blur">
              Marketplace, reimagined
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.04em] !text-[rgb(83,112,245)] sm:text-5xl md:text-6xl xl:text-[4.5rem]">
                Find standout products before everyone else does.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Browse trusted vendors, compare categories, and move from discovery
                to checkout in a storefront that feels curated instead of crowded.
              </p>
            </div>

            <form onSubmit={onSearchSubmit} className="space-y-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/95 p-2 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.9)] backdrop-blur">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex-1 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search products, brands, categories..."
                      className="w-full border-0 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-[1.2rem] bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Search marketplace
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold uppercase tracking-[0.22em] text-white/60">
                  Popular now
                </span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => navigate(`/products?q=${encodeURIComponent(term)}`)}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold text-white transition hover:bg-white/15"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/products"
                className="rounded-full bg-amber-300 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Explore all products
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Go to dashboard
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Become a vendor
                </Link>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {trustHighlights.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
                >
                  <p className="text-2xl font-black tracking-tight text-white">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                    {item.label}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:col-span-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
                    Discovery lanes
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                    Shop by signal, not guesswork
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="text-xs font-semibold text-amber-200 transition hover:text-amber-100"
                >
                  Browse all
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {derivedCategories.slice(0, 4).map((category, index) => (
                  <Link
                    key={category}
                    to={`/products?q=${encodeURIComponent(category)}`}
                    className={`group rounded-[1.4rem] px-4 py-4 ring-1 transition hover:-translate-y-0.5 ${CATEGORY_SURFACES[index % CATEGORY_SURFACES.length]}`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                      Category
                    </p>
                    <p className="mt-2 text-lg font-black tracking-tight">
                      {category}
                    </p>
                    <p className="mt-5 text-xs font-semibold opacity-75 transition group-hover:opacity-100">
                      Search this collection
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
                  Storefront focus
                </p>
                <p className="mt-3 text-xl font-black leading-tight text-white">
                  Cleaner discovery. Faster decisions. Better conversion energy.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  The home experience should feel premium before the customer ever
                  clicks into a product page.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-amber-300 to-orange-300 p-5 text-slate-950">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-800/70">
                  Built for
                </p>
                <div className="mt-4 space-y-3 text-sm font-semibold">
                  <p>Shoppers</p>
                  <p>Sellers</p>
                  <p>Admins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Featured selection
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Fresh picks from live sellers
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              A more editorial product grid makes the first row feel intentional
              instead of mechanically repeated.
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-slate-900 transition hover:text-amber-700"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          {featuredProducts.map((item, index) => (
            <article
              key={item._id}
              className={`group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_-36px_rgba(15,23,42,0.4)] ${
                index === 0 ? "xl:col-span-6 xl:row-span-2" : "xl:col-span-3"
              }`}
            >
              <div className={`relative ${index === 0 ? "h-80" : "h-60"}`}>
                {item.imageUrl ? (
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_42%,_#cbd5e1)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-950">
                    {item.categoryId?.name || "Uncategorized"}
                  </span>
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-950">
                    ${item.price}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                    {item.vendorId?.name || "Vendor"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                    {item.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <p className="text-sm leading-6 text-slate-600">
                  {item.description || "No description available."}
                </p>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Stock {item.stock}
                  </p>
                  <Link
                    to={`/products/${item._id}`}
                    className="text-sm font-semibold text-slate-950 transition hover:text-amber-700"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {isLoadingProducts && (
          <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-500">
            Loading featured products...
          </div>
        )}

        {!isLoadingProducts && featuredProducts.length === 0 && (
          <div className="rounded-[1.8rem] border border-slate-200 bg-white px-6 py-8 text-sm leading-6 text-slate-600 shadow-sm">
            No products available yet. Add products from the vendor panel to
            populate this section.
          </div>
        )}
      </section>

      {recentlyViewed.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Recently viewed
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                Pick up where you left off
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                A light discovery layer that keeps the latest products you opened
                within easy reach on your next visit.
              </p>
            </div>
            <Link
              to="/products"
              className="text-sm font-semibold text-slate-900 transition hover:text-amber-700"
            >
              Continue browsing
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recentlyViewed.slice(0, 4).map((item, index) => (
              <article
                key={item._id}
                className={`group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_-36px_rgba(15,23,42,0.4)] ${
                  index === 0 ? "xl:col-span-2" : ""
                }`}
              >
                <div className={`relative ${index === 0 ? "h-72" : "h-60"}`}>
                  {item.imageUrl ? (
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_42%,_#cbd5e1)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-950">
                      {item.categoryName || "Uncategorized"}
                    </span>
                    <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-950">
                      ${item.price}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                      {item.vendorName || "Vendor"}
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-5">
                  <p className="text-sm font-semibold text-slate-600">
                    Rating {Number(item.averageRating || 0).toFixed(1)}
                  </p>
                  <Link
                    to={`/products/${item._id}`}
                    className="text-sm font-semibold text-slate-950 transition hover:text-amber-700"
                  >
                    Revisit product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.25)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Browse by category
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
              Fast paths into the catalog
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              These categories still come from the same product data, but the UI
              now feels like a curated launchpad instead of a generic tag wall.
            </p>
          </div>
          <Link
            to="/products"
            className="rounded-full bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse products
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {derivedCategories.map((category, index) => (
            <Link
              key={category}
              to={`/products?q=${encodeURIComponent(category)}`}
              className={`rounded-[1.4rem] px-4 py-4 ring-1 transition hover:-translate-y-0.5 ${
                CATEGORY_SURFACES[index % CATEGORY_SURFACES.length]
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-70">
                Explore
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">{category}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_32px_90px_-52px_rgba(15,23,42,0.85)] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute bottom-[-30%] left-[18%] h-52 w-52 rounded-full bg-sky-300/10 blur-3xl" />
        </div>

        <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
              One platform, all roles
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              Shopping, selling, and storefront operations in one polished flow
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              The logic stays the same. The experience now feels more premium,
              more confident, and more memorable from the first screen.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Link
              to={isAuthenticated ? "/products" : "/register"}
              className="w-full rounded-full bg-amber-300 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-200 md:w-auto"
            >
              {isAuthenticated ? "Start shopping" : "Create an account"}
            </Link>
            <Link
              to="/products"
              className="w-full rounded-full border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15 md:w-auto"
            >
              Browse marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
