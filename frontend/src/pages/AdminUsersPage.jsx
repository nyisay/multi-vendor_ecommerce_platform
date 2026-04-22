import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { adminApi } from "../services/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Manage Users</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review account roles and vendor approval states without leaving the admin panel.
          </p>
        </div>
        {loading ? (
          <p className="text-sm font-semibold text-slate-600">Loading users...</p>
        ) : (
          <div className="overflow-auto rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)]">
            <table className="min-w-full text-sm text-slate-700">
              <thead className="bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="p-3 font-bold">Name</th>
                  <th className="p-3 font-bold">Email</th>
                  <th className="p-3 font-bold">Role</th>
                  <th className="p-3 font-bold">Vendor Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100 transition hover:bg-amber-50/40">
                    <td className="p-3 font-semibold text-slate-900">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.vendorStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
