import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { getImageUrl, productApi } from "../services/api";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await productApi.getAllForAdmin();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      try {
        const data = await productApi.getAllForAdmin();
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          showToast(err.message, "error");
          setLoading(false);
        }
      }
    };
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const removeProduct = async (id) => {
    try {
      await productApi.adminDelete(id);
      showToast("Product deleted", "success");
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        {loading ? (
          <p className="text-sm text-gray-600">Loading products...</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <article key={product._id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="h-14 w-14 rounded object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded bg-gray-200" />
                  )}
                  <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.categoryId?.name} | Vendor: {product.vendorId?.name}
                  </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product._id)}
                  className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </article>
            ))}
            {!products.length && <p className="text-sm text-gray-600">No products found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
