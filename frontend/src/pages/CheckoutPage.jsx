import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { cartApi, orderApi } from "../services/api";
import {
  calculateCheckoutTotals,
  DELIVERY_METHOD_OPTIONS,
  formatPaymentMethod,
  getInitialCheckoutForm,
  PAYMENT_METHOD_OPTIONS,
} from "../services/checkout";
import { useToast } from "../context/useToast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { Card, CardBody } from "../components/ui/Card";
import { SectionHeading } from "../components/ui/Section";

const REQUIRED_FIELDS = [
  ["fullName", "full name"],
  ["phone", "phone"],
  ["addressLine1", "address line 1"],
  ["city", "city"],
  ["state", "state"],
  ["postalCode", "postal code"],
  ["country", "country"],
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState(null);
  const [form, setForm] = useState(() => getInitialCheckoutForm(user));
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialCheckoutForm(user));
  }, [
    user?._id,
    user?.name,
    user?.phone,
    user?.address,
    user?.defaultPaymentMethod,
    user?.defaultShippingAddress?.fullName,
    user?.defaultShippingAddress?.phone,
    user?.defaultShippingAddress?.addressLine1,
    user?.defaultShippingAddress?.addressLine2,
    user?.defaultShippingAddress?.city,
    user?.defaultShippingAddress?.state,
    user?.defaultShippingAddress?.postalCode,
    user?.defaultShippingAddress?.country,
  ]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await cartApi.get();
        setCart(data);
      } catch (err) {
        setError(err.message || "Failed to load checkout");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(
    () => calculateCheckoutTotals(cart?.items || [], form.deliveryMethod),
    [cart?.items, form.deliveryMethod],
  );

  const selectedPaymentOption =
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === form.paymentMethod) ||
    PAYMENT_METHOD_OPTIONS[0];

  const onFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const missingFields = REQUIRED_FIELDS.filter(([key]) => !String(form[key] || "").trim()).map(
    ([, label]) => label,
  );

  const handleCheckout = async () => {
    if (!cart?.items?.length) {
      showToast("Your cart is empty", "error");
      return;
    }

    if (missingFields.length > 0) {
      showToast(`Please complete: ${missingFields.join(", ")}`, "error");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const order = await orderApi.create({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
        deliveryMethod: form.deliveryMethod,
        paymentMethod: form.paymentMethod,
        orderNotes: form.orderNotes.trim(),
        saveCheckoutProfile: form.saveCheckoutProfile,
      });

      if (form.saveCheckoutProfile) {
        await refreshProfile();
      }

      showToast(
        order.paymentStatus === "paid"
          ? "Order placed and marked as paid"
          : "Order placed successfully",
        "success",
      );
      navigate("/orders");
    } catch (err) {
      setError(err.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <p className="text-sm font-medium text-slate-600">Loading checkout...</p>;
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        title="Checkout"
        description="Capture shipping details, choose delivery, and place a more complete order."
        right={
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="text-sm font-semibold text-slate-700 transition hover:text-amber-700"
          >
            ← Back to cart
          </button>
        }
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardBody className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                    Shipping details
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    These fields are required so the order can be fulfilled properly.
                  </p>
                </div>
                {form.saveCheckoutProfile ? (
                  <Badge variant="success">Save to profile</Badge>
                ) : (
                  <Badge variant="neutral">One-time checkout</Badge>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Full name
                  </label>
                  <Input
                    name="fullName"
                    value={form.fullName}
                    onChange={onFieldChange}
                    placeholder="Recipient full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={onFieldChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  Address line 1
                </label>
                <Input
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={onFieldChange}
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  Address line 2
                </label>
                <Input
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={onFieldChange}
                  placeholder="Apartment, suite, building"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    City
                  </label>
                  <Input
                    name="city"
                    value={form.city}
                    onChange={onFieldChange}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    State
                  </label>
                  <Input
                    name="state"
                    value={form.state}
                    onChange={onFieldChange}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Postal code
                  </label>
                  <Input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={onFieldChange}
                    placeholder="Postal code"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Country
                  </label>
                  <Input
                    name="country"
                    value={form.country}
                    onChange={onFieldChange}
                    placeholder="Country"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="saveCheckoutProfile"
                  checked={form.saveCheckoutProfile}
                  onChange={onFieldChange}
                />
                Save these checkout defaults to my profile
              </label>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Delivery method
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Shipping cost updates live in the order summary.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {DELIVERY_METHOD_OPTIONS.map((option) => {
                  const active = form.deliveryMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, deliveryMethod: option.value }))
                      }
                      className={`rounded-[1.4rem] border px-5 py-4 text-left transition ${
                        active
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-900 hover:border-amber-200 hover:bg-amber-50"
                      }`}
                    >
                      <p className="text-sm font-black tracking-tight">{option.label}</p>
                      <p
                        className={`mt-2 text-sm leading-6 ${
                          active ? "text-white/80" : "text-slate-600"
                        }`}
                      >
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Payment method
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Card checkout is simulated and marks the order as paid immediately.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {PAYMENT_METHOD_OPTIONS.map((option) => {
                  const active = form.paymentMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, paymentMethod: option.value }))
                      }
                      className={`rounded-[1.4rem] border px-5 py-4 text-left transition ${
                        active
                          ? "border-amber-300 bg-amber-300 text-slate-950"
                          : "border-slate-200 bg-white text-slate-900 hover:border-amber-200 hover:bg-amber-50"
                      }`}
                    >
                      <p className="text-sm font-black tracking-tight">{option.label}</p>
                      <p className="mt-2 text-sm leading-6 opacity-80">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Order notes
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Optional delivery notes or handling instructions for the order.
                </p>
              </div>
              <textarea
                name="orderNotes"
                rows={4}
                value={form.orderNotes}
                onChange={onFieldChange}
                placeholder="Add any helpful notes for shipping or order handling."
                className="w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-amber-50/30 focus:ring-2 focus:ring-amber-200/60"
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Order items
                </p>
                <Badge variant="neutral">{(cart?.items || []).length} items</Badge>
              </div>

              <div className="divide-y divide-slate-100">
                {(cart?.items || []).map((item) => {
                  const unitPrice = Number(item.productId?.price || 0);
                  const lineTotal = unitPrice * Number(item.quantity || 0);
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
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card className="overflow-hidden">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                    Summary
                  </p>
                  {form.paymentMethod === "card" ? (
                    <Badge variant="success">Auto-paid</Badge>
                  ) : (
                    <Badge variant="neutral">Pay later</Badge>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Subtotal</span>
                      <span className="font-black text-slate-950">
                        ${totals.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Shipping</span>
                      <span className="font-black text-slate-950">
                        ${totals.shippingFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="font-semibold text-slate-700">Total</span>
                      <span className="text-xl font-black text-slate-950">
                        ${totals.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-500">Delivery</span>
                    <span className="text-sm font-black text-slate-950">
                      {DELIVERY_METHOD_OPTIONS.find(
                        (option) => option.value === form.deliveryMethod,
                      )?.label || "Standard delivery"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-500">Payment</span>
                    <span className="text-sm font-black text-slate-950">
                      {formatPaymentMethod(form.paymentMethod)}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!cart?.items?.length || placing}
                  fullWidth
                >
                  {placing ? "Processing order..." : "Confirm checkout"}
                </Button>

                <p className="text-xs font-semibold text-slate-500">
                  Orders paid by card are marked as paid immediately. Cash on delivery
                  and bank transfer remain unpaid until processed later.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
