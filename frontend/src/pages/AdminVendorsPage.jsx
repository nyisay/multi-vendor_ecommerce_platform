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
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Manage Vendors</h1>
        {loading ? (
          <p className="text-sm font-semibold text-slate-600">Loading vendors...</p>
        ) : (
          <div className="space-y-3">
            {vendors.map((vendor) => (
              <article key={vendor._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)]">
                <p className="text-lg font-bold tracking-tight text-slate-900">{vendor.name}</p>
                <p className="text-sm text-slate-600">{vendor.email}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  Status: {vendor.vendorStatus}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["approved", "rejected", "pending"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatus(vendor._id, status)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {!vendors.length && <p className="text-sm font-medium text-slate-600">No vendors found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
