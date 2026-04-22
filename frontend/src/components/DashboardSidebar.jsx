import { NavLink } from "react-router-dom";

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2.5 text-sm font-semibold tracking-tight transition ${
          isActive
            ? "bg-blue-700 text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function DashboardSidebar({ role }) {
  if (role === "admin") {
    return (
      <aside className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]">
        <h3 className="px-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Admin</h3>
        <SidebarLink to="/admin/dashboard" label="Dashboard" />
        <SidebarLink to="/admin/users" label="Users" />
        <SidebarLink to="/admin/vendors" label="Vendors" />
        <SidebarLink to="/admin/products" label="Products" />
        <SidebarLink to="/admin/categories" label="Categories" />
        <SidebarLink to="/admin/orders" label="Orders" />
      </aside>
    );
  }

  return (
    <aside className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]">
      <h3 className="px-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Vendor</h3>
      <SidebarLink to="/vendor/dashboard" label="Dashboard" />
      <SidebarLink to="/vendor/products" label="Products" />
      <SidebarLink to="/vendor/orders" label="Orders" />
    </aside>
  );
}
