import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { orderApi } from "../services/api";
import {
  formatDeliveryMethod,
  formatPaymentMethod,
  formatShippingAddress,
} from "../services/checkout";

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
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Vendor workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Vendor Orders</h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep fulfillment updates aligned with the rest of the storefront experience.
          </p>
        </div>
        {loading ? (
          <p className="text-sm font-semibold text-slate-600">Loading orders...</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order._id} className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold tracking-tight text-slate-900">Order #{order._id.slice(-6)}</p>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">Buyer: {order.userId?.name}</p>
                <p className="text-sm text-slate-600">
                  Delivery: {formatDeliveryMethod(order.deliveryMethod)}
                </p>
                <p className="text-sm text-slate-600">
                  Payment: {formatPaymentMethod(order.paymentMethod)} · {order.paymentStatus}
                </p>
                <p className="text-sm text-slate-600">
                  Recipient: {order.shippingAddress?.fullName || "Customer"}
                </p>
                <p className="text-sm text-slate-600">
                  Address: {formatShippingAddress(order.shippingAddress) || "No shipping address saved."}
                </p>
                <p className="text-sm text-slate-600">Total: ${Number(order.totalPrice || 0).toFixed(2)}</p>
                {order.orderNotes ? (
                  <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Notes: {order.orderNotes}
                  </p>
                ) : null}
                <div className="mt-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Items</p>
                  <div className="mt-2 space-y-2">
                    {order.items?.map((item) => (
                      <div key={item._id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-700">
                          {item.productId?.name || "Product"} x {item.quantity}
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.fulfillmentStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["shipped", "delivered", "cancelled"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(order._id, status)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-slate-950"
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
