const RECENTLY_VIEWED_KEY = "mve_recently_viewed_products";
const MAX_RECENTLY_VIEWED = 6;

const normalizeRecentlyViewedProduct = (product) => ({
  _id: product._id,
  name: product.name,
  price: product.price,
  imageUrl: product.imageUrl || "",
  averageRating: Number(product.averageRating || 0),
  stock: Number(product.stock || 0),
  vendorName: product.vendorId?.name || "Unknown vendor",
  categoryName: product.categoryId?.name || "Uncategorized",
  viewedAt: new Date().toISOString()
});

export const getRecentlyViewedProducts = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRecentlyViewedProduct = (product) => {
  if (typeof window === "undefined" || !product?._id) {
    return [];
  }

  const nextItem = normalizeRecentlyViewedProduct(product);
  const nextItems = [
    nextItem,
    ...getRecentlyViewedProducts().filter((item) => item._id !== product._id),
  ].slice(0, MAX_RECENTLY_VIEWED);

  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextItems));
  return nextItems;
};
