import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import SkeletonCard from "../components/SkeletonCard";
import {
  categoryApi,
  cartApi,
  getImageUrl,
  productApi,
} from "../services/api";
import { useToast } from "../context/useToast";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";

const FILTER_PANEL_TONES = [
  "bg-amber-50 text-amber-950 ring-amber-200",
  "bg-sky-50 text-sky-950 ring-sky-200",
  "bg-emerald-50 text-emerald-950 ring-emerald-200",
];

export default function ProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = Number(searchParams.get("page") || 1);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchInput !== query) {
        updateFilters({ q: searchInput });
      }
    }, 350);
    return () => clearTimeout(timerId);
  }, [searchInput, query]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productApi.getAll({
          q: query || undefined,
          category: selectedCategory || undefined,
          sortBy,
          page,
          limit: 9,
        });
        setProducts(Array.isArray(data.items) ? data.items : []);
        setPagination(data.pagination || null);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, selectedCategory, sortBy, page, reloadKey]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  function updateFilters(next) {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    });
    if (Object.keys(next).some((key) => key !== "page")) {
      nextParams.set("page", "1");
    }
    setSearchParams(nextParams);
  }

  const goToPage = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  const addToCart = async (productId) => {
    try {
      await cartApi.add(productId, 1);
      showToast("Added to cart", "success");
    } catch (err) {
      showToast(err.message || "Could not add to cart", "error");
    }
  };

  return (
    <section className="space-y-6 md:space-y-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_26%),radial-gradient(circle_at_85%_18%,_rgba(56,189,248,0.16),_transparent_22%),linear-gradient(135deg,_#020617_0%,_#111827_58%,_#172554_100%)] px-6 py-7 text-white shadow-[0_30px_90px_-52px_rgba(15,23,42,0.95)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[10%] h-44 w-44 rounded-full bg-sky-300/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/55">
              Marketplace catalog
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Shop with more signal and less clutter.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Same product, category, cart, and pagination logic. Just a stronger
              storefront experience for search-heavy browsing.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Current page
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {pagination?.page || page}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Results
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {pagination?.total || products.length || 0}
              </p>
            </div>
            <Link
              to="/"
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.3)] sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Refine products
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Search, filter, and sort in one clean panel
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-12 md:items-end">
                <div className="md:col-span-6">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Search
                  </label>
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search products, categories, vendors..."
                    className="border-slate-200 bg-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onChange={(event) =>
                      updateFilters({ category: event.target.value })
                    }
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Sort by
                  </label>
                  <Select
                    value={sortBy}
                    onChange={(event) =>
                      updateFilters({ sortBy: event.target.value })
                    }
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </Select>
                </div>
              </div>

              {(query || selectedCategory) && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Active filters
                    </span>
                    {query ? (
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        "{query}"
                      </span>
                    ) : null}
                    {selectedCategory ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                        Category selected
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSearchParams(new URLSearchParams())}
                    className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${FILTER_PANEL_TONES[0]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Search term
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {query || "Everything"}
              </p>
            </article>

            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${FILTER_PANEL_TONES[1]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Sort mode
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {sortBy === "newest"
                  ? "Newest"
                  : sortBy === "price_asc"
                    ? "Price up"
                    : "Price down"}
              </p>
            </article>

            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${FILTER_PANEL_TONES[2]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Catalog state
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {loading ? "Updating..." : `${products.length} loaded`}
              </p>
            </article>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[1.6rem] border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-5 py-4 text-sm text-red-800 shadow-sm">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="mt-2 text-sm font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-12">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className={idx === 0 ? "xl:col-span-6" : "xl:col-span-3"}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Results
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                Products worth a closer look
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              {pagination
                ? `Showing ${products.length} of ${pagination.total} products`
                : `${products.length} products`}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-12">
            {products.map((product, index) => (
              <article
                key={product._id}
                className={`group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.32)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_-36px_rgba(15,23,42,0.38)] ${
                  index === 0 ? "xl:col-span-6" : "xl:col-span-3"
                }`}
              >
                <div className={`relative ${index === 0 ? "h-80" : "h-64"}`}>
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_45%,_#cbd5e1)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                    <p className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-950">
                      {product.categoryId?.name || "Uncategorized"}
                    </p>
                    <p className="rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-950">
                      ${product.price}
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                      {product.vendorId?.name || "Unknown vendor"}
                    </p>
                    <Link
                      to={`/products/${product._id}`}
                      className="mt-2 block text-2xl font-black tracking-tight text-white"
                    >
                      {product.name}
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Stock: {product.stock}
                    </p>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-sm font-semibold text-slate-950 transition hover:text-amber-700"
                    >
                      Details
                    </Link>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                    {product.description || "No description provided."}
                  </p>

                  {user?.role === "customer" && (
                    <Button onClick={() => addToCart(product._id)} fullWidth>
                      Add to cart
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] px-6 py-10 text-center shadow-sm">
          <p className="text-xl font-black tracking-tight text-slate-950">
            No products match this search.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Try a broader term, clear the category filter, or switch the sort
            mode.
          </p>
        </div>
      )}

      {pagination && (
        <div className="flex flex-col gap-4 rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Pagination
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages || 1}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              {pagination.page}
            </span>
            <button
              type="button"
              onClick={() =>
                goToPage(Math.min(pagination.totalPages || page, page + 1))
              }
              disabled={page >= (pagination.totalPages || 1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}