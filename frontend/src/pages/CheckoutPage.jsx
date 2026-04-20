import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi, orderApi } from "../services/api";
import { useToast } from "../context/useToast";

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

  if (loading) return <p className="text-sm text-gray-600">Loading checkout...</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      {error && <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        {(cart?.items || []).map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>
              {item.productId?.name} x {item.quantity}
            </span>
            <span>${(Number(item.productId?.price || 0) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-3 text-right font-semibold">Total: ${total.toFixed(2)}</div>
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        disabled={!cart?.items?.length || placing}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {placing ? "Processing..." : "Confirm Checkout"}
      </button>
    </section>
  );
}
