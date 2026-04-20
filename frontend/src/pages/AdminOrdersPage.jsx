import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { orderApi } from "../services/api";

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getAllAdmin();
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
        const data = await orderApi.getAllAdmin();
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
      await orderApi.updateAdminOrderStatus(orderId, { status });
      showToast("Order status updated", "success");
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        {loading ? (
          <p className="text-sm text-gray-600">Loading orders...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order._id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs uppercase">{order.status}</span>
                </div>
                <p className="text-sm text-gray-600">Customer: {order.userId?.name}</p>
                <p className="text-sm text-gray-600">Payment: {order.paymentStatus}</p>
                <p className="text-sm text-gray-600">Total: ${order.totalPrice}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(order._id, status)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
