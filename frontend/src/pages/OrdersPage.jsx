import { useEffect, useState } from "react";
import { orderApi } from "../services/api";
import { useToast } from "../context/useToast";

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await orderApi.getMine();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    try {
      await orderApi.cancel(orderId);
      showToast("Order cancelled", "success");
      const data = await orderApi.getMine();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-600">Data from `/api/orders`.</p>
      </div>

      {loading && <p className="text-gray-600">Loading orders...</p>}
      {error && <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order._id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Order #{order._id.slice(-6)}</p>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold uppercase text-gray-700">
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-700">Total: ${order.totalPrice}</p>
            <p className="text-xs text-gray-600">Payment: {order.paymentStatus}</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {order.items?.map((item) => (
                <li key={item._id}>
                  {item.productId?.name || "Product"} x {item.quantity}
                </li>
              ))}
            </ul>
            {["pending", "paid"].includes(order.status) && (
              <button
                type="button"
                onClick={() => cancelOrder(order._id)}
                className="mt-3 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Cancel order
              </button>
            )}
          </article>
        ))}
      </div>

      {!loading && orders.length === 0 && (
        <p className="rounded bg-white p-4 text-sm text-gray-600 shadow-sm">No orders yet.</p>
      )}
    </section>
  );
}
