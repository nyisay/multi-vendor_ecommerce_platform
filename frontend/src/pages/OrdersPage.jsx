import { useEffect, useState } from "react";
import { orderApi } from "../services/api";
import {
  formatDeliveryMethod,
  formatPaymentMethod,
  formatShippingAddress,
} from "../services/checkout";
import { useToast } from "../context/useToast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";
import { SectionHeading } from "../components/ui/Section";

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadOrders();
    }, 0);

    return () => clearTimeout(timerId);
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
    <section className="space-y-6">
      <SectionHeading title="Orders" description="Track and manage your orders." />

      {loading && <p className="text-sm font-semibold text-slate-600">Loading orders...</p>}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-red-700">
          <p>{error}</p>
          <button type="button" onClick={loadOrders} className="mt-2 underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Order</p>
                  <p className="mt-1 text-lg font-black tracking-tight text-slate-950">#{order._id.slice(-6)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="neutral">{order.status}</Badge>
                  <p className="text-sm font-black text-slate-950">${Number(order.totalPrice || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-4 ring-1 ring-amber-100">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Items</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {order.items?.map((item) => (
                    <li key={item._id} className="flex items-center justify-between gap-3">
                      <span className="truncate font-semibold">{item.productId?.name || "Product"}</span>
                      <span className="shrink-0 text-xs font-bold text-slate-500">x {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    Delivery
                  </p>
                  <p className="mt-2 text-sm font-black text-slate-950">
                    {formatDeliveryMethod(order.deliveryMethod)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.shippingAddress?.fullName || "Recipient"} ·{" "}
                    {order.shippingAddress?.phone || "No phone"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {formatShippingAddress(order.shippingAddress) || "No shipping address saved."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    Payment
                  </p>
                  <p className="mt-2 text-sm font-black text-slate-950">
                    {formatPaymentMethod(order.paymentMethod)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Subtotal ${Number(order.subtotal || order.totalPrice || 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Shipping ${Number(order.shippingFee || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {order.orderNotes ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    Order notes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{order.orderNotes}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-500">Payment: {order.paymentStatus}</p>
                {["pending", "paid"].includes(order.status) && (
                  <Button variant="danger" size="sm" onClick={() => cancelOrder(order._id)}>
                    Cancel order
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {!loading && orders.length === 0 && (
        <Card>
          <CardBody className="text-center">
            <p className="text-sm font-semibold text-slate-700">No orders yet.</p>
            <p className="mt-1 text-sm text-slate-600">When you checkout, your orders will show here.</p>
          </CardBody>
        </Card>
      )}
    </section>
  );
}
