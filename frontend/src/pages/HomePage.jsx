import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PRODUCT_MENU_GROUPS } from "../data/productMegaMenu";
import { getImageUrl, productApi } from "../services/api";

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
    return categories.length > 0 ? categories.slice(0, 8) : PRODUCT_MENU_GROUPS.map((group) => group.title).slice(0, 8);
  }, [products]);

  const featuredProducts = useMemo(() => {
    if (!products.length) {
      return [];
    }
    return products.slice(0, 6);
  }, [products]);

  const trustHighlights = useMemo(() => {
    const uniqueVendors = new Set(products.map((item) => item.vendorId?._id).filter(Boolean)).size;
    const uniqueCategories = new Set(products.map((item) => item.categoryId?._id).filter(Boolean)).size;

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
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-white/70 to-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gray-200/60 blur-3xl" />
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-gray-100 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/2 h-96 w-[520px] -translate-x-1/2 rounded-full bg-gray-200/50 blur-3xl" />
        </div>

        <div className="relative grid gap-10 p-8 md:grid-cols-12 md:p-12">
          <div className="space-y-6 md:col-span-7">
            <p className="inline-flex items-center rounded-full bg-[#91ADC2] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Built for modern multi-vendor shopping
            </p>

            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-gray-950 sm:text-5xl md:text-6xl">
              Shop the drops.
              <br />
              Discover new vendors.
            </h1>

            <p className="max-w-xl text-base text-gray-600 sm:text-lg">
              Discover products from trusted sellers, compare options, and complete checkout in a smooth shopping flow.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/products"
                className="rounded-full bg-[#91ADC2] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#9BA0BC]"
              >
                Shop now
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="rounded-full border border-gray-300 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Go to dashboard
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="rounded-full border border-gray-300 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Become a vendor
                </Link>
              )}
            </div>

            <form onSubmit={onSearchSubmit} className="mt-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products, brands, categories…"
                    className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#9BA0BC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7A8B99]"
                >
                  Search
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Popular:</span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => navigate(`/products?q=${encodeURIComponent(term)}`)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>

          <div className="md:col-span-5">
            <div className="grid gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">Today’s highlights</h2>
                <Link to="/products" className="text-xs font-semibold text-gray-600 hover:text-gray-900">
                  Browse all
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {trustHighlights.map((item) => (
                  <article key={item.label} className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
                    <p className="text-2xl font-black text-gray-950">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</p>
                  </article>
                ))}
              </div>
              <div className="rounded-2xl bg-[#9BA0BC] p-4 text-white">
                <p className="text-sm font-bold">Fast checkout. Real roles.</p>
                <p className="mt-1 text-xs text-white/80">Built for shoppers, sellers, and store administrators.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Featured picks</h2>
            <p className="mt-1 text-sm text-gray-600">Fresh picks from active sellers in the marketplace.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-gray-800 hover:text-[#7A8B99]">
            View all products
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((item) => (
            <article
              key={item._id}
              className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative">
                {item.imageUrl ? (
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-56 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{item.vendorId?.name || "Vendor"}</p>
                    <p className="truncate text-lg font-black tracking-tight text-white">{item.name}</p>
                  </div>
                  <p className="shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-sm font-extrabold text-gray-950">
                    ${item.price}
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {item.categoryId?.name || "Uncategorized"}
                </p>
                <p className="line-clamp-2 text-sm text-gray-600">{item.description || "No description available."}</p>
                <div className="flex items-center justify-between pt-2 text-xs font-semibold text-gray-600">
                  <span>Stock: {item.stock}</span>
                  <Link to={`/products/${item._id}`} className="text-gray-900 hover:underline">
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {isLoadingProducts && <p className="text-sm text-gray-500">Loading featured products...</p>}
        {!isLoadingProducts && featuredProducts.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No products available yet. Add products from the vendor panel to populate this section.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-950">Top categories right now</h2>
            <p className="mt-1 text-sm text-gray-600">
              Categories are based on active inventory to help shoppers find products faster.
            </p>
          </div>
          <Link to="/products" className="rounded-full bg-[#91ADC2] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#9BA0BC]">
            Browse products
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {derivedCategories.map((category) => (
            <Link
              key={category}
              to={`/products?q=${encodeURIComponent(category)}`}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#7A8B99] p-8 text-white">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/90">Built for growth</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">One platform for shopping, selling, and operations</h2>
            <p className="mt-2 text-sm text-white/80">
              Deliver a polished storefront with reliable catalog, order, and account workflows.
            </p>
          </div>
          <div className="flex items-center md:justify-end">
            <Link
              to={isAuthenticated ? "/products" : "/register"}
              className="w-full rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-100 md:w-auto"
            >
              {isAuthenticated ? "Start shopping" : "Create an account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
