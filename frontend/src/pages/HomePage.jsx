import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getImageUrl, productApi } from "../services/api";

const quickCategories = [
  "Consumer Electronics",
  "Home & Living",
  "Apparel & Accessories",
  "Beauty & Personal Care",
  "Industrial Tools",
  "Packaging & Printing",
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

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

  const derivedCategories = useMemo(() => {
    const categorySet = new Set(
      products.map((item) => item.categoryId?.name).filter(Boolean),
    );
    const categories = Array.from(categorySet);
    return categories.length > 0 ? categories.slice(0, 6) : quickCategories;
  }, [products]);

  const featuredProducts = useMemo(() => {
    if (!products.length) {
      return [];
    }
    return products.slice(0, 4);
  }, [products]);

  const trustHighlights = useMemo(() => {
    const uniqueVendors = new Set(products.map((item) => item.vendorId?._id).filter(Boolean)).size;
    const uniqueCategories = new Set(products.map((item) => item.categoryId?._id).filter(Boolean)).size;

    return [
      { label: "Active products", value: String(products.length || 0) },
      { label: "Verified suppliers", value: String(uniqueVendors || 0) },
      { label: "Categories", value: String(uniqueCategories || 0) },
      { label: "Assignment-ready modules", value: "Customer, Vendor, Admin" },
    ];
  }, [products]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  };

  const popularSearches = ["headphones", "packaging", "bottle", "ring light"];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-orange-50 via-white to-gray-50">
        <div className="grid gap-6 p-8 md:grid-cols-5 md:p-10">
          <div className="space-y-4 md:col-span-3">
            <p className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              Global B2B Sourcing
            </p>

            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              Find trusted suppliers and grow your multi-vendor business
            </h1>

            <p className="max-w-2xl text-gray-600">
              Source quality products, compare suppliers, and manage orders in one platform. Built for assignment demo with
              real customer, vendor, and admin flows.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="rounded-lg bg-orange-500 px-5 py-3 text-center font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                Start Sourcing
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-800 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  Become a Supplier
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-800 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">Quick Product Search</h2>
            <p className="mt-1 text-sm text-gray-600">Search and jump directly to filtered product results.</p>
            <form onSubmit={onSearchSubmit} className="mt-4 space-y-3">
              <div className="rounded-lg border border-gray-300 p-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full border-0 px-2 py-2 text-sm text-gray-700 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
              >
                Search Products
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => navigate(`/products?q=${encodeURIComponent(term)}`)}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustHighlights.map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="mt-1 text-sm text-gray-600">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold text-gray-900">Top Categories</h2>
          <p className="mt-1 text-sm text-gray-600">Inspired by large B2B marketplaces, optimized for your assignment scope.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
          {derivedCategories.map((category) => (
            <Link
              key={category}
              to={`/products?q=${encodeURIComponent(category)}`}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 transition hover:-translate-y-0.5 hover:bg-gray-100"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Wholesale Products</h2>
            <p className="text-sm text-gray-600">Live data from your current products API.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            View all products
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((item) => (
            <article
              key={item._id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              {item.imageUrl ? (
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="mb-4 h-28 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-4 h-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="mt-1 text-sm text-gray-600">${item.price}</p>
              <p className="text-xs text-gray-500">Stock: {item.stock}</p>
              <p className="mt-3 text-xs font-medium text-gray-700">{item.vendorId?.name || "Supplier"}</p>
            </article>
          ))}
        </div>
        {isLoadingProducts && <p className="text-sm text-gray-500">Loading featured products...</p>}
        {!isLoadingProducts && featuredProducts.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            No products available yet. Add products from the vendor panel to populate this section.
          </p>
        )}
      </section>

      <section className="grid gap-4 rounded-2xl bg-gray-900 p-7 text-white md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold">Post your sourcing request and get supplier quotes</h2>
          <p className="mt-2 text-sm text-gray-300">
            Add this as your assignment wow-factor feature. You can later connect it to a real RFQ endpoint.
          </p>
        </div>
        <div className="flex items-center md:justify-end">
          <Link to="/register" className="w-full rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white hover:bg-orange-600 md:w-auto">
            Post Request
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        {isAuthenticated ? (
          <p className="text-sm text-gray-700">
            Logged in as <span className="font-semibold uppercase">{user.role}</span>. Use the top navigation for your role workflow.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="rounded bg-gray-900 px-4 py-2 font-semibold text-white">
              Login
            </Link>
            <Link to="/register" className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700">
              Register
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
