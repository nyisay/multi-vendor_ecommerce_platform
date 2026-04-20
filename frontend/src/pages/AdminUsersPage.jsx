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
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        {loading ? (
          <p className="text-sm text-gray-600">Loading users...</p>
        ) : (
          <div className="overflow-auto rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Vendor Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="p-3">{user.name}</td>
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
