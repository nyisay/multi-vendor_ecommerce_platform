import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import SkeletonCard from "../components/SkeletonCard";
import { categoryApi, cartApi, getImageUrl, productApi } from "../services/api";
import { useToast } from "../context/useToast";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";

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
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Shop</h1>
          <p className="mt-1 text-sm text-gray-600">Browse products from your marketplace vendors.</p>
        </div>
        <Link to="/" className="text-sm font-semibold text-gray-800 hover:text-blue-700">
          Back to home
        </Link>
      </header>

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <Input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search products, categories, vendors…"
              className="bg-gray-50"
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={selectedCategory}
              onChange={(event) => updateFilters({ category: event.target.value })}
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
            <Select
              value={sortBy}
              onChange={(event) => updateFilters({ sortBy: event.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </Select>
          </div>
        </div>

        {(query || selectedCategory) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-gray-500">
              Filters active
              {query ? ` · “${query}”` : ""}
            </p>
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-200"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product._id}
              className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative">
                {product.imageUrl ? (
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="truncate text-xs font-bold uppercase tracking-widest text-gray-200">
                    {product.categoryId?.name || "Uncategorized"}
                  </p>
                  <Link
                    to={`/products/${product._id}`}
                    className="mt-1 line-clamp-2 text-lg font-black tracking-tight text-white hover:underline"
                  >
                    {product.name}
                  </Link>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-black text-gray-950">${product.price}</p>
                  <p className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    Stock: {product.stock}
                  </p>
                </div>

                <p className="line-clamp-2 text-sm text-gray-600">
                  {product.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-gray-600">
                  <span className="truncate">By {product.vendorId?.name || "Unknown vendor"}</span>
                  <Link to={`/products/${product._id}`} className="text-gray-900 hover:underline">
                    Details
                  </Link>
                </div>

                {user?.role === "customer" && (
                  <Button onClick={() => addToCart(product._id)} fullWidth>
                    Add to cart
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
          No products match this search.
        </div>
      )}

      {pagination && (
        <div className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-gray-700">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(pagination.totalPages || page, page + 1))}
              disabled={page >= (pagination.totalPages || 1)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
