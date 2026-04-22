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
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Manage Users</h1>
        {loading ? (
          <p className="text-sm font-semibold text-slate-600">Loading users...</p>
        ) : (
          <div className="overflow-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)]">
            <table className="min-w-full text-sm text-slate-700">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="p-3 font-bold">Name</th>
                  <th className="p-3 font-bold">Email</th>
                  <th className="p-3 font-bold">Role</th>
                  <th className="p-3 font-bold">Vendor Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100">
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
