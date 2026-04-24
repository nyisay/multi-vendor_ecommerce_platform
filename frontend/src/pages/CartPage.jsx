import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartApi } from "../services/api";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";
import { SectionHeading } from "../components/ui/Section";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch (err) {
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      try {
        const data = await cartApi.get();
        if (!cancelled) {
          setCart(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load cart");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  const estimatedTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const unitPrice = Number(item.productId?.price || 0);
      return sum + unitPrice * item.quantity;
    }, 0);
  }, [cart]);

  const updateQty = async (productId, nextQty) => {
    try {
      await cartApi.updateQuantity(productId, nextQty);
      await loadCart();
    } catch (err) {
      setError(err.message || "Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartApi.remove(productId);
      await loadCart();
    } catch (err) {
      setError(err.message || "Failed to remove item");
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeading
        title="Cart"
        description="Review items before checkout."
        right={
          <Link to="/products" className="text-sm font-semibold text-slate-800 transition hover:text-amber-700">
            Continue shopping
          </Link>
        }
      />

      {loading && <p className="text-sm font-semibold text-slate-600">Loading cart...</p>}
      {error && <p className="rounded-2xl border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {(cart?.items || []).map((item) => {
            const unitPrice = Number(item.productId?.price || 0);
            const lineTotal = unitPrice * item.quantity;
            return (
              <Card key={item._id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black tracking-tight text-slate-950">
                        {item.productId?.name || "Item"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Unit price <span className="text-slate-950">${unitPrice.toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Qty {item.quantity}</Badge>
                      <Badge variant="dark">${lineTotal.toFixed(2)}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-2 shadow-sm">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.productId?._id, Math.max(1, item.quantity - 1))}
                        className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-900 transition hover:bg-amber-50"
                      >
                        −
                      </button>
                      <span className="min-w-10 text-center text-sm font-extrabold text-slate-950">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.productId?._id, item.quantity + 1)}
                        className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-900 transition hover:bg-amber-50"
                      >
                        +
                      </button>
                    </div>

                    <Button variant="danger" size="sm" onClick={() => removeItem(item.productId?._id)}>
                      Remove
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}

          {!loading && (!cart?.items || cart.items.length === 0) && (
            <Card>
              <CardBody className="text-center">
                <p className="text-sm font-semibold text-slate-700">Your cart is empty.</p>
                <p className="mt-1 text-sm text-slate-600">Browse products and add items to get started.</p>
                <div className="mt-5">
                  <Link to="/products">
                    <Button>Shop products</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card>
              <CardBody className="space-y-4">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Order summary</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Estimated total</span>
                  <span className="text-lg font-black text-slate-950">${estimatedTotal.toFixed(2)}</span>
                </div>

                <div className="grid gap-2">
                  <Button
                    onClick={() => navigate("/checkout")}
                    disabled={!cart?.items || cart.items.length === 0}
                    fullWidth
                  >
                    Proceed to checkout
                  </Button>
                </div>

                <div className="rounded-2xl bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-4 ring-1 ring-amber-100">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Notes</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Order totals and item availability are updated in real time from current catalog data.
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
