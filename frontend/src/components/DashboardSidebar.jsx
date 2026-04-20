import { NavLink } from "react-router-dom";

function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded px-3 py-2 text-sm font-medium ${
          isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
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
      <aside className="space-y-2 rounded-xl border border-gray-200 bg-white p-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-wide text-gray-500">Admin</h3>
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
    <aside className="space-y-2 rounded-xl border border-gray-200 bg-white p-3">
      <h3 className="px-1 text-xs font-bold uppercase tracking-wide text-gray-500">Vendor</h3>
      <SidebarLink to="/vendor/dashboard" label="Dashboard" />
      <SidebarLink to="/vendor/products" label="Products" />
      <SidebarLink to="/vendor/orders" label="Orders" />
    </aside>
  );
}
