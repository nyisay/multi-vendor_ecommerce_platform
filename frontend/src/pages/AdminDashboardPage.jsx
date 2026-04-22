import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { orderApi } from "../services/api";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await orderApi.getAdminAnalytics();
        setAnalytics(
          data || { totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 },
        );
      } catch (err) {
        setError(err.message || "Failed to load dashboard analytics");
        setAnalytics({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: "Total Orders", value: analytics.totalOrders },
    { label: "Revenue", value: `$${Number(analytics.totalRevenue || 0).toFixed(2)}` },
    { label: "Users", value: analytics.totalUsers },
    { label: "Products", value: analytics.totalProducts },
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
        {loading && <p className="text-sm font-semibold text-slate-600">Loading analytics...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{card.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
