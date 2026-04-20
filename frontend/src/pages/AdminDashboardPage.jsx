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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderApi.getAdminAnalytics();
        setAnalytics(
          data || { totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 },
        );
      } catch {
        setAnalytics({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, totalProducts: 0 });
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
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
