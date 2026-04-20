import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { adminApi } from "../services/api";

export default function AdminVendorsPage() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      try {
        const data = await adminApi.getVendors();
        if (!cancelled) {
          setVendors(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          showToast(err.message, "error");
          setLoading(false);
        }
      }
    };
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const setStatus = async (vendorId, status) => {
    try {
      await adminApi.updateVendorStatus(vendorId, status);
      showToast("Vendor status updated", "success");
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Vendors</h1>
        {loading ? (
          <p className="text-sm text-gray-600">Loading vendors...</p>
        ) : (
          <div className="space-y-3">
            {vendors.map((vendor) => (
              <article key={vendor._id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-900">{vendor.name}</p>
                <p className="text-sm text-gray-600">{vendor.email}</p>
                <p className="text-sm text-gray-600">Status: {vendor.vendorStatus}</p>
                <div className="mt-2 flex gap-2">
                  {["approved", "rejected", "pending"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus(vendor._id, status)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {!vendors.length && <p className="text-sm text-gray-600">No vendors found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
