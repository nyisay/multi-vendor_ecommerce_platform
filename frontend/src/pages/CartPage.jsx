import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartApi, orderApi } from "../services/api";
import { useToast } from "../context/useToast";

export default function CartPage() {
  const { showToast } = useToast();
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

  const placeOrder = async () => {
    setError("");
    try {
      await orderApi.create();
      showToast("Order placed successfully", "success");
      await loadCart();
    } catch (err) {
      setError(err.message || "Failed to place order");
    }
  };

  const updateQty = async (productId, nextQty) => {
    try {
      await cartApi.updateQuantity(productId, nextQty);
      await loadCart();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartApi.remove(productId);
      showToast("Item removed", "success");
      await loadCart();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
        <p className="text-sm text-gray-600">Data from `/api/cart`.</p>
      </div>

      {loading && <p className="text-gray-600">Loading cart...</p>}
      {error && <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="space-y-3">
        {cart?.items?.map((item) => (
          <article key={item._id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-gray-900">{item.productId?.name || "Item"}</h2>
                <p className="text-sm text-gray-600">Unit: ${item.productId?.price || 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQty(item.productId?._id, Math.max(1, item.quantity - 1))}
                  className="rounded border border-gray-300 px-2"
                >
                  -
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.productId?._id, item.quantity + 1)}
                  className="rounded border border-gray-300 px-2"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId?._id)}
                  className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && (!cart?.items || cart.items.length === 0) && (
        <p className="rounded bg-white p-4 text-sm text-gray-600 shadow-sm">Your cart is empty.</p>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="font-semibold text-gray-900">Estimated total: ${estimatedTotal.toFixed(2)}</p>
        <button
          type="button"
          onClick={placeOrder}
          disabled={!cart?.items || cart.items.length === 0}
          className="mt-3 rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Place Order
        </button>
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          disabled={!cart?.items || cart.items.length === 0}
          className="ml-2 mt-3 rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 disabled:opacity-50"
        >
          Go to Checkout
        </button>
        <Link to="/products" className="ml-2 text-sm text-gray-600 underline">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
