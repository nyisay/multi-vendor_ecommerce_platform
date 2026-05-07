import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { adminApi } from "../services/api";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banUpdatingId, setBanUpdatingId] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadUsers();
    };
    load();
  }, []);

  const handleBanToggle = async (targetUser) => {
    const nextBanState = !targetUser.isBanned;
    const actionLabel = nextBanState ? "ban" : "unban";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${targetUser.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setBanUpdatingId(targetUser._id);
    try {
      const response = await adminApi.updateUserBanStatus(targetUser._id, nextBanState);
      setUsers((prev) =>
        prev.map((user) => (user._id === targetUser._id ? response.user : user)),
      );
      showToast(response.message, "success");
    } catch (error) {
      showToast(error.message || `Could not ${actionLabel} user`, "error");
    } finally {
      setBanUpdatingId("");
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Manage Users</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review account roles, vendor approval states, and ban access when needed.
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
                  <th className="p-3 font-bold">Account Status</th>
                  <th className="p-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrentAdmin = user._id === currentUser?._id;
                  const isAdmin = user.role === "admin";
                  const actionDisabled = isCurrentAdmin || isAdmin || banUpdatingId === user._id;

                  return (
                  <tr
                    key={user._id}
                    className={`border-t border-slate-100 transition hover:bg-amber-50/40 ${
                      user.isBanned ? "bg-rose-50/40" : ""
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.vendorStatus}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                          user.isBanned
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="p-3">
                      {isCurrentAdmin ? (
                        <span className="text-xs font-semibold text-slate-500">Current admin</span>
                      ) : isAdmin ? (
                        <span className="text-xs font-semibold text-slate-500">Protected admin</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBanToggle(user)}
                          disabled={actionDisabled}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                            user.isBanned
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-rose-600 text-white hover:bg-rose-700"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {banUpdatingId === user._id
                            ? "Saving..."
                            : user.isBanned
                              ? "Unban user"
                              : "Ban user"}
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
