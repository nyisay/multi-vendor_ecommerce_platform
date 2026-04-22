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
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="vendor" />
      <div className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Vendor Dashboard</h1>
        {loading && <p className="text-sm font-semibold text-slate-600">Loading dashboard...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
