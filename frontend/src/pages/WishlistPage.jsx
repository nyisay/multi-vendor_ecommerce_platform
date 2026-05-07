import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cartApi, getImageUrl, wishlistApi } from "../services/api";
import { useToast } from "../context/useToast";
import Button from "../components/ui/Button";

const METRIC_SURFACES = [
  "bg-amber-100 text-amber-950 ring-amber-200",
  "bg-sky-100 text-sky-950 ring-sky-200",
  "bg-emerald-100 text-emerald-950 ring-emerald-200",
  "bg-rose-100 text-rose-950 ring-rose-200",
];

const IMAGE_STAGE_SURFACES = [
  "bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_48%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]",
  "bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_50%),linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_100%)]",
  "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_50%),linear-gradient(180deg,_#ffffff_0%,_#ecfdf5_100%)]",
  "bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_50%),linear-gradient(180deg,_#ffffff_0%,_#fff1f2_100%)]",
];

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;
const formatRating = (value) => Number(value || 0).toFixed(1);
const getCategoryName = (item) => item.categoryId?.name || "Uncategorized";
const getVendorName = (item) => item.vendorId?.name || "Unknown vendor";

const getDescriptionPreview = (value, maxLength = 150) => {
  if (!value || !value.trim()) {
    return "Saved from the catalog for a closer look when you are ready to compare it side by side.";
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

const getProductImages = (item) => {
  const baseImages =
    Array.isArray(item.imageUrls) && item.imageUrls.length
      ? item.imageUrls
      : [item.imageUrl];

  return Array.from(new Set(baseImages.filter(Boolean)));
};

function WishlistMetricCard({ label, value, detail, tone }) {
  return (
    <div className={`rounded-[1.6rem] px-4 py-4 ring-1 ${tone}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm font-semibold opacity-80">{detail}</p>
    </div>
  );
}

function WishlistLoadingCard({ featured = false }) {
  return (
    <div
      className={`animate-pulse overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.32)] ${
        featured ? "md:col-span-2 xl:col-span-2" : ""
      }`}
    >
      <div className={featured ? "grid lg:grid-cols-[1.05fr_0.95fr]" : ""}>
        <div className={`${featured ? "min-h-[24rem]" : "h-72"} bg-slate-100`} />
        <div className="space-y-4 p-6">
          <div className="h-4 w-28 rounded-full bg-slate-200" />
          <div className="h-10 w-4/5 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 rounded-full bg-slate-100" />
            <div className="h-4 rounded-full bg-slate-100" />
            <div className="h-4 w-3/4 rounded-full bg-slate-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-[1.3rem] bg-slate-100" />
            <div className="h-20 rounded-[1.3rem] bg-slate-100" />
            <div className="h-20 rounded-[1.3rem] bg-slate-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-11 rounded-xl bg-slate-200" />
            <div className="h-11 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WishlistProductCard({
  item,
  featured = false,
  className = "",
  stageTone,
  cartProductId,
  removingProductId,
  onAddCart,
  onRemove,
}) {
  const images = getProductImages(item);
  const primaryImage = images[0];
  const categoryName = getCategoryName(item);
  const vendorName = getVendorName(item);
  const isInStock = item.stock > 0;

  return (
    <article
      className={`group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.34)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_-44px_rgba(15,23,42,0.4)] ${className}`}
    >
      <div className={featured ? "grid h-full lg:grid-cols-[1.05fr_0.95fr]" : ""}>
        <div
          className={`relative overflow-hidden ${
            featured ? "min-h-[24rem]" : "h-72"
          } ${stageTone}`}
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/55 blur-3xl" />
          <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-slate-950/5 blur-3xl" />

          {primaryImage ? (
            <img
              src={getImageUrl(primaryImage)}
              alt={item.name}
              className={`h-full w-full object-contain transition duration-500 ${
                featured
                  ? "p-8 drop-shadow-[0_24px_45px_rgba(15,23,42,0.18)] group-hover:scale-[1.03] sm:p-10"
                  : "p-6 drop-shadow-[0_20px_38px_rgba(15,23,42,0.16)] group-hover:scale-[1.04]"
              }`}
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_42%,_#cbd5e1)]" />
          )}

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-950 shadow-sm">
              {categoryName}
            </span>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-black text-white shadow-sm">
              {formatPrice(item.price)}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
              {featured ? "Latest save" : "Saved item"}
            </span>
            {images.length > 1 ? (
              <span className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                {images.length} photos
              </span>
            ) : null}
          </div>
        </div>

        <div
          className={`flex flex-col ${
            featured ? "justify-between gap-6 p-6 sm:p-7" : "gap-5 p-5"
          }`}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                {vendorName}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                  isInStock
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-rose-100 text-rose-900"
                }`}
              >
                {isInStock ? `${item.stock} ready to ship` : "Out of stock"}
              </span>
            </div>

            <div>
              <Link
                to={`/products/${item._id}`}
                className={`block line-clamp-2 font-black tracking-tight text-slate-950 transition hover:text-amber-700 ${
                  featured ? "text-3xl sm:text-[2.15rem]" : "text-2xl"
                }`}
              >
                {item.name}
              </Link>
              <p
                className={`mt-3 text-sm leading-7 text-slate-600 ${
                  featured ? "line-clamp-2 max-w-xl" : "line-clamp-2"
                }`}
              >
                {getDescriptionPreview(item.description, featured ? 220 : 140)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Rating
                </p>
                <p className="mt-2 text-lg font-black text-slate-950">
                  {formatRating(item.averageRating)} / 5
                </p>
              </div>
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Gallery
                </p>
                <p className="mt-2 text-lg font-black text-slate-950">
                  {images.length} {images.length === 1 ? "photo" : "photos"}
                </p>
              </div>
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Stock
                </p>
                <p className="mt-2 text-lg font-black text-slate-950">
                  {item.stock > 0 ? `${item.stock} units` : "Unavailable"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => onAddCart(item._id)}
                disabled={!isInStock || cartProductId === item._id}
                className="sm:flex-1"
              >
                {cartProductId === item._id ? "Adding..." : "Add to cart"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onRemove(item._id)}
                disabled={removingProductId === item._id}
                className="sm:flex-1"
              >
                {removingProductId === item._id ? "Removing..." : "Remove"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">
                {featured
                  ? "Your newest save gets the most space so it is easier to compare before checkout."
                  : "Open the full product page for reviews, details, and seller context."}
              </p>
              <Link
                to={`/products/${item._id}`}
                className="text-sm font-semibold text-slate-950 transition hover:text-amber-700"
              >
                View details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function WishlistPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [removingProductId, setRemovingProductId] = useState("");
  const [cartProductId, setCartProductId] = useState("");

  useEffect(() => {
    let active = true;

    const loadWishlist = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await wishlistApi.getMine();
        if (active) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load wishlist");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRemove = async (productId) => {
    setRemovingProductId(productId);

    try {
      const response = await wishlistApi.remove(productId);
      setItems(Array.isArray(response.items) ? response.items : []);
      showToast(response.message || "Removed from wishlist", "success");
    } catch (err) {
      showToast(err.message || "Could not update wishlist", "error");
    } finally {
      setRemovingProductId("");
    }
  };

  const handleAddCart = async (productId) => {
    setCartProductId(productId);

    try {
      await cartApi.add(productId, 1);
      showToast("Added to cart", "success");
    } catch (err) {
      showToast(err.message || "Could not add to cart", "error");
    } finally {
      setCartProductId("");
    }
  };

  const featuredItem = items[0] || null;
  const remainingItems = featuredItem ? items.slice(1) : [];

  const summary = useMemo(() => {
    const readyToCartCount = items.filter((item) => item.stock > 0).length;
    const multiPhotoCount = items.filter((item) => getProductImages(item).length > 1).length;
    const averagePrice = items.length
      ? items.reduce((total, item) => total + Number(item.price || 0), 0) / items.length
      : 0;
    const topRatedItem = items.reduce((best, item) => {
      if (!best) {
        return item;
      }

      return Number(item.averageRating || 0) > Number(best.averageRating || 0)
        ? item
        : best;
    }, null);

    return {
      readyToCartCount,
      multiPhotoCount,
      averagePrice,
      topRatedItem,
    };
  }, [items]);

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_52%,_#111827_100%)] shadow-[0_34px_110px_-52px_rgba(15,23,42,0.72)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300/80">
              Saved collection
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Wishlist that feels worth revisiting.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Bigger product stages, cleaner hierarchy, and sharper save-to-cart actions
              make the shortlist feel more premium and easier to scan.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
              >
                Browse products
              </Link>
              {featuredItem ? (
                <Link
                  to={`/products/${featuredItem._id}`}
                  className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15"
                >
                  Open latest save
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <WishlistMetricCard
              label="Saved now"
              value={String(items.length)}
              detail="Items you can return to without searching again."
              tone={METRIC_SURFACES[0]}
            />
            <WishlistMetricCard
              label="Ready for cart"
              value={String(summary.readyToCartCount)}
              detail="Products currently in stock and ready to move."
              tone={METRIC_SURFACES[1]}
            />
            <WishlistMetricCard
              label="Multi-photo picks"
              value={String(summary.multiPhotoCount)}
              detail="Saved items with extra gallery angles to review."
              tone={METRIC_SURFACES[2]}
            />
            <WishlistMetricCard
              label="Best rating"
              value={
                summary.topRatedItem
                  ? `${formatRating(summary.topRatedItem.averageRating)} / 5`
                  : "--"
              }
              detail={
                summary.topRatedItem
                  ? summary.topRatedItem.name
                  : "Add products to start building your shortlist."
              }
              tone={METRIC_SURFACES[3]}
            />
          </div>
        </div>
      </div>

      {!loading && !error && items.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            Average saved price:{" "}
            <span className="font-black text-slate-950">
              {formatPrice(summary.averagePrice)}
            </span>
          </p>
          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <p className="text-sm text-slate-600">
            Latest save appears first so your newest consideration is always easiest to
            revisit.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[1.9rem] border border-rose-200 bg-[linear-gradient(135deg,_#fff1f2_0%,_#ffffff_100%)] p-5 shadow-[0_22px_55px_-44px_rgba(225,29,72,0.35)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700">
            Wishlist unavailable
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-rose-950">
            We could not load your saved products right now.
          </p>
          <p className="mt-2 text-sm leading-6 text-rose-800/85">{error}</p>
          <div className="mt-5">
            <Button variant="outline" onClick={() => setReloadKey((current) => current + 1)}>
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <WishlistLoadingCard featured />
          <WishlistLoadingCard />
          <WishlistLoadingCard />
        </div>
      ) : null}

      {!loading && !error && featuredItem ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <WishlistProductCard
            item={featuredItem}
            featured
            className={remainingItems.length ? "md:col-span-2 xl:col-span-2" : "md:col-span-2 xl:col-span-3"}
            stageTone={IMAGE_STAGE_SURFACES[0]}
            cartProductId={cartProductId}
            removingProductId={removingProductId}
            onAddCart={handleAddCart}
            onRemove={handleRemove}
          />

          {remainingItems.map((item, index) => (
            <WishlistProductCard
              key={item._id}
              item={item}
              stageTone={IMAGE_STAGE_SURFACES[(index + 1) % IMAGE_STAGE_SURFACES.length]}
              cartProductId={cartProductId}
              removingProductId={removingProductId}
              onAddCart={handleAddCart}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_#fffef7_0%,_#ffffff_45%,_#f8fafc_100%)] shadow-[0_24px_70px_-46px_rgba(15,23,42,0.28)]">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-500">
                Nothing saved yet
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Build a shortlist that feels intentional.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                Save products while you browse, then come back to compare price,
                ratings, stock, and seller details in one focused space.
              </p>

              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Start saving products
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Save faster
                </p>
                <p className="mt-3 text-lg font-black text-slate-950">
                  Keep products you are not ready to buy yet.
                </p>
              </div>
              <div className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Compare better
                </p>
                <p className="mt-3 text-lg font-black text-slate-950">
                  Revisit images, ratings, and stock without restarting your search.
                </p>
              </div>
              <div className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:col-span-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Move with confidence
                </p>
                <p className="mt-3 text-lg font-black text-slate-950">
                  When you are ready, jump straight from saved items to cart with one
                  cleaner decision flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
