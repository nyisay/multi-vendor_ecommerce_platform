import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import SkeletonCard from "../components/SkeletonCard";
import { categoryApi, cartApi, getImageUrl, productApi } from "../services/api";
import { useToast } from "../context/useToast";

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
  }, [query, selectedCategory, sortBy, page]);

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

  const updateFilters = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);
    });
    if (Object.keys(next).some((key) => key !== "page")) {
      nextParams.set("page", "1");
    }
    setSearchParams(nextParams);
  };

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
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-600">Public storefront listing from `/api/products`.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="grid gap-2 md:grid-cols-4">
          <input
            type="text"
            value={query}
            onChange={(event) => {
              updateFilters({ q: event.target.value });
            }}
            placeholder="Search by product, category, supplier..."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 md:col-span-2"
          />
          <select
            value={selectedCategory}
            onChange={(event) => updateFilters({ category: event.target.value })}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) => updateFilters({ sortBy: event.target.value })}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {error && <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {!loading && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product._id}
            className="space-y-3 rounded-xl bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            {product.imageUrl ? (
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="h-40 w-full rounded object-cover"
              />
            ) : (
              <div className="h-40 w-full rounded bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
            <div>
              <Link to={`/products/${product._id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                {product.name}
              </Link>
              <p className="text-sm text-gray-500">{product.description || "No description"}</p>
            </div>

            <div className="text-sm text-gray-700">
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock}</p>
              <p>Vendor: {product.vendorId?.name || "Unknown"}</p>
              <p>Category: {product.categoryId?.name || "Uncategorized"}</p>
            </div>

            {user?.role === "customer" && (
              <button
                type="button"
                onClick={() => addToCart(product._id)}
                className="w-full rounded bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Add to Cart
              </button>
            )}
          </article>
        ))}
      </div>}

      {!loading && products.length === 0 && (
        <p className="rounded bg-white p-4 text-sm text-gray-600 shadow-sm">No products match this search.</p>
      )}

      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(pagination.totalPages || page, page + 1))}
              disabled={page >= (pagination.totalPages || 1)}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
