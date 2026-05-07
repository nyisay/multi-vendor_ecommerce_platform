export const getProductImages = (product) => {
  const baseImages =
    Array.isArray(product?.imageUrls) && product.imageUrls.length
      ? product.imageUrls
      : [product?.imageUrl];

  return Array.from(
    new Set(
      baseImages
        .map((imageUrl) => (typeof imageUrl === "string" ? imageUrl.trim() : ""))
        .filter(Boolean),
    ),
  );
};

export const getPrimaryProductImage = (product) => getProductImages(product)[0] || "";
