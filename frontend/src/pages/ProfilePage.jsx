import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

export default function ProfilePage() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        ...(user?.role === "vendor" ? { shopName: formData.get("shopName") } : {}),
        ...(password ? { password } : {}),
      };
      await updateProfile(payload);
      await refreshProfile();
      showToast("Profile updated", "success");
      setPassword("");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-600">Update your account details.</p>
      </div>

      <form key={user?._id || "guest"} onSubmit={onSubmit} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <input
          name="name"
          defaultValue={user?.name || ""}
          placeholder="Name"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <input
          value={user?.email || ""}
          disabled
          className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
        />
        <input
          name="phone"
          defaultValue={user?.phone || ""}
          placeholder="Phone"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <input
          name="address"
          defaultValue={user?.address || ""}
          placeholder="Address"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {user?.role === "vendor" && (
          <input
            name="shopName"
            defaultValue={user?.shopName || ""}
            placeholder="Shop name"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        )}
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password (optional)"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}
