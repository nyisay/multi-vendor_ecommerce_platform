import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi, orderApi } from "../services/api";
import { useToast } from "../context/useToast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";
import { SectionHeading } from "../components/ui/Section";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await cartApi.get();
        setCart(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + Number(item.productId?.price || 0) * item.quantity, 0);
  }, [cart]);

  const handleCheckout = async () => {
    setPlacing(true);
    try {
      await orderApi.create();
      showToast("Checkout successful", "success");
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <p className="text-sm font-medium text-slate-600">Loading checkout...</p>;

  return (
    <section className="space-y-6">
      <SectionHeading
        title="Checkout"
        description="Review your items and place the order."
        right={
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="text-sm font-semibold text-slate-700 transition hover:text-blue-700"
          >
            ← Back to cart
          </button>
        }
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">Order items</p>
                <Badge variant="neutral">{(cart?.items || []).length} items</Badge>
              </div>

              <div className="divide-y divide-slate-100">
                {(cart?.items || []).map((item) => {
                  const unitPrice = Number(item.productId?.price || 0);
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <div
                      key={item._id}
                      className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                          {item.productId?.name || "Item"}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">
                          Qty {item.quantity} · Unit ${unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-black text-slate-900">${lineTotal.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">Payment details</p>
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-sm font-semibold text-slate-800">Secure checkout summary</p>
                <p className="mt-1 text-sm text-slate-600">
                  Your order is created through the marketplace checkout service and then routed for
                  fulfillment.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card className="overflow-hidden">
              <CardBody className="space-y-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">Summary</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Order total</span>
                    <span className="text-xl font-black text-slate-950">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!cart?.items?.length || placing}
                  fullWidth
                >
                  {placing ? "Processing..." : "Confirm checkout"}
                </Button>

                <p className="text-xs font-semibold text-slate-500">
                  By confirming, this order will be placed and visible in your order history.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
