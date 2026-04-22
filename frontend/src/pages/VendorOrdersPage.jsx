import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { orderApi } from "../services/api";

export default function VendorOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getVendorOrders();
      setOrders(Array.isArray(data) ? data : []);
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
        const data = await orderApi.getVendorOrders();
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
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

  const updateStatus = async (orderId, status) => {
    try {
      await orderApi.updateVendorOrderStatus(orderId, status);
      showToast("Order status updated", "success");
      await loadOrders();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="vendor" />
      <div className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Vendor Orders</h1>
        {loading ? (
          <p className="text-sm font-semibold text-slate-600">Loading orders...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold tracking-tight text-slate-900">Order #{order._id.slice(-6)}</p>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">Buyer: {order.userId?.name}</p>
                <p className="text-sm text-slate-600">Total: ${order.totalPrice}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["shipped", "delivered", "cancelled"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(order._id, status)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {!orders.length && <p className="text-sm font-medium text-slate-600">No orders found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
