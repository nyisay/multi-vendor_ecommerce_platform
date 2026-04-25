import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { orderApi } from "../services/api";

function SidebarLink({ to, label, badgeCount = 0 }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-semibold tracking-tight transition ${
          isActive
            ? "bg-amber-300 text-slate-950 shadow-[0_18px_35px_-24px_rgba(251,191,36,0.85)]"
            : "text-slate-700 hover:bg-white hover:text-slate-950"
        }`
      }
    >
      <span>{label}</span>
      {badgeCount > 0 ? (
        <span className="inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-[0_10px_22px_-12px_rgba(225,29,72,0.85)]">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function DashboardSidebar({ role }) {
  const [vendorNewOrderCount, setVendorNewOrderCount] = useState(0);

  useEffect(() => {
    if (role !== "vendor") {
      return undefined;
    }

    let active = true;

    const loadVendorOrderNotifications = async () => {
      try {
        const orders = await orderApi.getVendorOrders();
        if (!active) {
          return;
        }

        const pendingOrderCount = (Array.isArray(orders) ? orders : []).filter((order) =>
          Array.isArray(order.items) &&
          order.items.some((item) => item.fulfillmentStatus === "pending")
        ).length;

        setVendorNewOrderCount(pendingOrderCount);
      } catch {
        if (active) {
          setVendorNewOrderCount(0);
        }
      }
    };

    loadVendorOrderNotifications();
    const intervalId = window.setInterval(loadVendorOrderNotifications, 30000);
    const handleVendorOrdersChanged = () => {
      loadVendorOrderNotifications();
    };
    window.addEventListener("vendor-orders-changed", handleVendorOrdersChanged);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("vendor-orders-changed", handleVendorOrdersChanged);
    };
  }, [role]);

  if (role === "admin") {
    return (
      <aside className="space-y-2 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-3 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.42)]">
        <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Admin</h3>
        <SidebarLink to="/admin/dashboard" label="Dashboard" />
        <SidebarLink to="/admin/strategic-dashboard" label="Strategic" />
        <SidebarLink to="/admin/marketing-dashboard" label="Marketing" />
        <SidebarLink to="/admin/users" label="Users" />
        <SidebarLink to="/admin/vendors" label="Vendors" />
        <SidebarLink to="/admin/products" label="Products" />
        <SidebarLink to="/admin/categories" label="Categories" />
        <SidebarLink to="/admin/orders" label="Orders" />
      </aside>
    );
  }

  return (
    <aside className="space-y-2 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-3 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.42)]">
      <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Vendor</h3>
      <SidebarLink to="/vendor/dashboard" label="Dashboard" />
      <SidebarLink to="/vendor/operational-dashboard" label="Operational" />
      <SidebarLink to="/vendor/products" label="Products" />
      <SidebarLink to="/vendor/orders" label="Orders" badgeCount={vendorNewOrderCount} />
    </aside>
  );
}
