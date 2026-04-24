import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import { orderApi, productApi } from "../services/api";

const STAT_SURFACES = [
  "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]",
  "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]",
  "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]",
  "border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]",
];

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

  const workspaceViews = [
    {
      title: "Operational dashboard",
      description: "Switch to a day-to-day execution view for fulfillment, stock attention, and storefront upkeep.",
      to: "/vendor/operational-dashboard",
    },
    {
      title: "Manage orders",
      description: "Move directly into the vendor order queue when you are ready to act.",
      to: "/vendor/orders",
    },
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="vendor" />
      <div className="space-y-4">
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Vendor workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Vendor Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track revenue, order volume, and product activity from a storefront-matched panel.
          </p>
        </div>
        {loading && <p className="text-sm font-semibold text-slate-600">Loading dashboard...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item, index) => (
            <article key={item.label} className={`rounded-[1.7rem] border p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)] ${STAT_SURFACES[index % STAT_SURFACES.length]}`}>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
            </article>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {workspaceViews.map((view, index) => (
            <Link
              key={view.title}
              to={view.to}
              className={`rounded-[1.7rem] border p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] ${
                index === 0
                  ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]"
                  : "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Expanded view</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">{view.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{view.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
