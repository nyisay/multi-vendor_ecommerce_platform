import { getPrimaryProductImage, getProductImages } from "./productImages";

const RECENTLY_VIEWED_KEY = "mve_recently_viewed_products";
const MAX_RECENTLY_VIEWED = 6;

const normalizeRecentlyViewedProduct = (product, viewedAt = new Date().toISOString()) => ({
  _id: product._id,
  name: product.name,
  price: product.price,
  imageUrl: getPrimaryProductImage(product),
  imageUrls: getProductImages(product),
  averageRating: Number(product.averageRating || 0),
  stock: Number(product.stock || 0),
  vendorName: product.vendorId?.name || product.vendorName || "Unknown vendor",
  categoryName: product.categoryId?.name || product.categoryName || "Uncategorized",
  viewedAt
});

const persistRecentlyViewedProducts = (items) => {
  const normalizedItems = items
    .filter((item) => item?._id)
    .slice(0, MAX_RECENTLY_VIEWED);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(normalizedItems));
  }

  return normalizedItems;
};

const normalizeStoredRecentlyViewedProduct = (product) =>
  normalizeRecentlyViewedProduct(product, product?.viewedAt || new Date().toISOString());

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
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalizedItems = parsed.map(normalizeStoredRecentlyViewedProduct);
    if (JSON.stringify(parsed) !== JSON.stringify(normalizedItems)) {
      persistRecentlyViewedProducts(normalizedItems);
    }

    return normalizedItems;
  } catch {
    return [];
  }
};

export const saveRecentlyViewedProduct = (product) => {
  if (typeof window === "undefined" || !product?._id) {
    return [];
  }

  const nextItem = normalizeRecentlyViewedProduct(product);
  return persistRecentlyViewedProducts([
    nextItem,
    ...getRecentlyViewedProducts().filter((item) => item._id !== product._id),
  ]);
};

export const syncRecentlyViewedProducts = async (loadProductById) => {
  const currentItems = getRecentlyViewedProducts();
  if (!currentItems.length || typeof loadProductById !== "function") {
    return currentItems;
  }

  const syncedItems = await Promise.all(
    currentItems.map(async (item) => {
      try {
        const liveProduct = await loadProductById(item._id);
        return normalizeRecentlyViewedProduct(liveProduct, item.viewedAt);
      } catch (error) {
        if (error?.status === 404) {
          return null;
        }

        return normalizeStoredRecentlyViewedProduct(item);
      }
    }),
  );

  return persistRecentlyViewedProducts(syncedItems.filter(Boolean));
};
