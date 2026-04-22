import { NavLink } from "react-router-dom";

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-[1rem] px-3 py-2.5 text-sm font-semibold tracking-tight transition ${
          isActive
            ? "bg-amber-300 text-slate-950 shadow-[0_18px_35px_-24px_rgba(251,191,36,0.85)]"
            : "text-slate-700 hover:bg-white hover:text-slate-950"
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
      <aside className="space-y-2 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-3 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.42)]">
        <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Admin</h3>
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
    <aside className="space-y-2 rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-3 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.42)]">
      <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Vendor</h3>
      <SidebarLink to="/vendor/dashboard" label="Dashboard" />
      <SidebarLink to="/vendor/products" label="Products" />
      <SidebarLink to="/vendor/orders" label="Orders" />
    </aside>
  );
}
