import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { cartApi, getImageUrl, productApi } from "../services/api";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Card, CardBody } from "../components/ui/Card";

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

  if (loading) return <p className="text-sm text-gray-600">Loading product...</p>;
  if (error) return <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>;
  if (!product) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/products" className="text-sm font-semibold text-gray-800 hover:text-[#7A8B99]">
          ← Back to shop
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{product.categoryId?.name || "Uncategorized"}</Badge>
          <Badge variant={product.stock > 0 ? "success" : "danger"}>{product.stock > 0 ? "In stock" : "Out of stock"}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card className="overflow-hidden">
            <div className="relative">
              {product.imageUrl ? (
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div className="h-[420px] w-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-extrabold uppercase tracking-widest text-gray-200">Vendor</p>
                <p className="mt-1 truncate text-sm font-semibold text-white">{product.vendorId?.name || "Unknown vendor"}</p>
              </div>
            </div>
          </Card>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardBody className="space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Details</p>
                <p className="text-sm text-gray-700">{product.description || "Details will be updated soon."}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Specs</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-900">Stock:</span> {product.stock}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Rating:</span>{" "}
                    {product.averageRating?.toFixed?.(1) || "0.0"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Category:</span>{" "}
                    {product.categoryId?.name || "Uncategorized"}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <Card>
              <CardBody className="space-y-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-950">{product.name}</h1>
                  <p className="mt-1 text-sm font-semibold text-gray-600">
                    Sold by <span className="text-gray-900">{product.vendorId?.name || "Unknown vendor"}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Price</p>
                  <p className="text-2xl font-black text-gray-950">${product.price}</p>
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

                <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Why shop here</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#91ADC2]" />
                      Secure checkout experience
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#91ADC2]" />
                      Multi-vendor marketplace structure
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#91ADC2]" />
                      Reliable support for every order
                    </li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
