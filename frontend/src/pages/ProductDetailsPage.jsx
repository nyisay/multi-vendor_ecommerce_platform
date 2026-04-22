import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { cartApi, getImageUrl, productApi } from "../services/api";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";

const DETAIL_SURFACES = [
  "bg-amber-50 text-amber-950 ring-amber-200",
  "bg-sky-50 text-sky-950 ring-sky-200",
  "bg-emerald-50 text-emerald-950 ring-emerald-200",
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productApi.getById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddCart = async () => {
    try {
      await cartApi.add(id, 1);
      showToast("Added to cart", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        Loading product...
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-[1.6rem] border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
        {error}
      </p>
    );
  }

  if (!product) return null;

  return (
    <section className="space-y-6 md:space-y-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_82%_20%,_rgba(56,189,248,0.16),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#111827_54%,_#1e293b_100%)] px-6 py-7 text-white shadow-[0_30px_90px_-52px_rgba(15,23,42,0.95)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[14%] h-48 w-48 rounded-full bg-sky-300/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Link
              to="/products"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 transition hover:bg-white/15"
            >
              Back to shop
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge variant="neutral">
                {product.categoryId?.name || "Uncategorized"}
              </Badge>
              <Badge variant={product.stock > 0 ? "success" : "danger"}>
                {product.stock > 0 ? "In stock" : "Out of stock"}
              </Badge>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Sold by {product.vendorId?.name || "Unknown vendor"} in a shopping
              flow designed to feel curated, clear, and purchase-ready.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Price
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                ${product.price}
              </p>
            </article>
            <article className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Rating
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {product.averageRating?.toFixed?.(1) || "0.0"}
              </p>
            </article>
            <article className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Stock
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {product.stock}
              </p>
            </article>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.45)]">
            <div className="relative">
              {product.imageUrl ? (
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                />
              ) : (
                <div className="h-[420px] w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_42%,_#cbd5e1)] sm:h-[520px]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                    Vendor spotlight
                  </p>
                  <p className="mt-2 text-xl font-black tracking-tight text-white">
                    {product.vendorId?.name || "Unknown vendor"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Product presentation should feel premium before the customer
                    even decides to purchase.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${DETAIL_SURFACES[0]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Category
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {product.categoryId?.name || "Uncategorized"}
              </p>
            </article>

            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${DETAIL_SURFACES[1]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Inventory
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {product.stock > 0 ? `${product.stock} available` : "Sold out"}
              </p>
            </article>

            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${DETAIL_SURFACES[2]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Rating
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {product.averageRating?.toFixed?.(1) || "0.0"} / 5
              </p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-[1.8rem] border border-slate-200 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
              <CardBody className="space-y-3 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Product story
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Details that help buyers commit faster
                </h2>
                <p className="text-sm leading-7 text-slate-600">
                  {product.description || "Details will be updated soon."}
                </p>
              </CardBody>
            </Card>

            <Card className="rounded-[1.8rem] border border-slate-200 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
              <CardBody className="space-y-4 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Quick specs
                </p>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-500">Stock</span>
                    <span className="font-black text-slate-950">{product.stock}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-500">Rating</span>
                    <span className="font-black text-slate-950">
                      {product.averageRating?.toFixed?.(1) || "0.0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-500">Category</span>
                    <span className="font-black text-slate-950">
                      {product.categoryId?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="xl:col-span-5">
          <div className="sticky top-24 space-y-4">
            <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.45)]">
              <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Buying panel
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                  Ready to add this to the cart?
                </h2>
              </div>

              <CardBody className="space-y-5 p-6">
                <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                    Total price
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-tight text-white">
                    ${product.price}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Sold by {product.vendorId?.name || "Unknown vendor"}.
                  </p>
                </div>

                {user?.role === "customer" ? (
                  <Button onClick={handleAddCart} fullWidth disabled={product.stock <= 0}>
                    Add to cart
                  </Button>
                ) : (
                  <Link to="/login" className="block">
                    <Button fullWidth>Login as customer to buy</Button>
                  </Link>
                )}

                <div className="grid gap-3 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Why shop here
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                    <p className="text-sm leading-6 text-slate-700">
                      Secure checkout experience with a cleaner marketplace flow.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
                    <p className="text-sm leading-6 text-slate-700">
                      Structured for multi-vendor shopping without losing clarity.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
                    <p className="text-sm leading-6 text-slate-700">
                      Reliable support around every order and catalog interaction.
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Availability
                  </p>
                  <p className="mt-2 text-lg font-black tracking-tight text-slate-950">
                    {product.stock > 0 ? "Available for checkout" : "Currently unavailable"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {product.stock > 0
                      ? "This item can be added to the cart right now."
                      : "This item is visible in the catalog but cannot be purchased at the moment."}
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