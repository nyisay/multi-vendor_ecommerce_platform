import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { orderApi } from "../services/api";

const STAT_SURFACES = [
  "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]",
  "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]",
  "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]",
  "border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]",
];

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
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Marketplace performance, activity, and inventory signals in one place.
          </p>
        </div>
        {loading && <p className="text-sm font-semibold text-slate-600">Loading analytics...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <article key={card.label} className={`rounded-[1.7rem] border p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)] ${STAT_SURFACES[index % STAT_SURFACES.length]}`}>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{card.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
