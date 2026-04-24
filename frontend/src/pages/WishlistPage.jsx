import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cartApi, getImageUrl, wishlistApi } from "../services/api";
import { useToast } from "../context/useToast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";
import { SectionHeading } from "../components/ui/Section";

export default function WishlistPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [removingProductId, setRemovingProductId] = useState("");
  const [cartProductId, setCartProductId] = useState("");

  useEffect(() => {
    let active = true;

    const loadWishlist = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await wishlistApi.getMine();
        if (active) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load wishlist");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRemove = async (productId) => {
    setRemovingProductId(productId);

    try {
      const response = await wishlistApi.remove(productId);
      setItems(Array.isArray(response.items) ? response.items : []);
      showToast(response.message || "Removed from wishlist", "success");
    } catch (err) {
      showToast(err.message || "Could not update wishlist", "error");
    } finally {
      setRemovingProductId("");
    }
  };

  const handleAddCart = async (productId) => {
    setCartProductId(productId);

    try {
      await cartApi.add(productId, 1);
      showToast("Added to cart", "success");
    } catch (err) {
      showToast(err.message || "Could not add to cart", "error");
    } finally {
      setCartProductId("");
    }
  };

  return (
    <section className="space-y-6">
      <SectionHeading
        title="Wishlist"
        description="Products you saved for a later decision."
        right={(
          <Link
            to="/products"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse products
          </Link>
        )}
      />

      {error ? (
        <div className="rounded-[1.6rem] border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-5 py-4 text-sm text-red-800 shadow-sm">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="mt-2 text-sm font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Loading wishlist...
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Card
              key={item._id}
              className="overflow-hidden rounded-[1.9rem] border border-slate-200 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.32)]"
            >
              <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                <div className="relative h-60 md:h-full">
                  {item.imageUrl ? (
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_42%,_#cbd5e1)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                </div>

                <CardBody className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">{item.categoryId?.name || "Uncategorized"}</Badge>
                    <Badge variant={item.stock > 0 ? "success" : "danger"}>
                      {item.stock > 0 ? "In stock" : "Out of stock"}
                    </Badge>
                  </div>

                  <div>
                    <Link
                      to={`/products/${item._id}`}
                      className="text-2xl font-black tracking-tight text-slate-950 transition hover:text-amber-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description || "Saved from the catalog for a later look."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Price
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950">${item.price}</p>
                    </div>
                    <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Rating
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950">
                        {Number(item.averageRating || 0).toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Vendor
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950">
                        {item.vendorId?.name || "Vendor"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => handleAddCart(item._id)}
                      disabled={item.stock <= 0 || cartProductId === item._id}
                    >
                      {cartProductId === item._id ? "Adding..." : "Add to cart"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRemove(item._id)}
                      disabled={removingProductId === item._id}
                    >
                      {removingProductId === item._id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </CardBody>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <Card className="rounded-[1.9rem] border border-slate-200">
          <CardBody className="space-y-3 px-6 py-10 text-center">
            <p className="text-2xl font-black tracking-tight text-slate-950">
              Your wishlist is empty
            </p>
            <p className="text-sm leading-7 text-slate-600">
              Save products while browsing so you can compare them later without
              interrupting the rest of your shopping flow.
            </p>
            <div className="pt-2">
              <Link to="/products" className="inline-flex">
                <Button>Start saving products</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </section>
  );
}
