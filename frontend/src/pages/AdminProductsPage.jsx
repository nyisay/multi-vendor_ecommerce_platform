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
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Manage Products</h1>
        {loading ? (
          <p className="text-sm font-semibold text-slate-600">Loading products...</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <article key={product._id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-slate-200" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">
                      {product.categoryId?.name} | Vendor: {product.vendorId?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product._id)}
                  className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  Delete
                </button>
              </article>
            ))}
            {!products.length && <p className="text-sm font-medium text-slate-600">No products found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
