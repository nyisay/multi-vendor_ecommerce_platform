import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { orderApi, productApi } from "../services/api";

export default function VendorDashboardPage() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 });
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [s, products] = await Promise.all([orderApi.getVendorStats(), productApi.getMine()]);
        setStats(s || { totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 });
        setProductCount(Array.isArray(products) ? products.length : 0);
      } catch (err) {
        setError(err.message || "Failed to load vendor dashboard");
        setStats({ totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: "Revenue", value: `$${Number(stats.totalRevenue || 0).toFixed(2)}` },
    { label: "Items Sold", value: stats.totalItemsSold || 0 },
    { label: "Orders", value: stats.totalOrders || 0 },
    { label: "Products", value: productCount },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <DashboardSidebar role="vendor" />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        {loading && <p className="text-sm font-semibold text-gray-600">Loading dashboard...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => (
            <article key={item.label} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
