import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { cartApi, getImageUrl, productApi } from "../services/api";

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
  if (error) return <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!product) return null;

  return (
    <section className="grid gap-6 rounded-xl bg-white p-6 shadow-sm md:grid-cols-2">
      {product.imageUrl ? (
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="h-72 w-full rounded object-cover"
        />
      ) : (
        <div className="h-72 rounded bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-sm text-gray-600">{product.description || "No description"}</p>
        <p className="text-xl font-semibold text-gray-900">${product.price}</p>
        <p className="text-sm text-gray-600">Category: {product.categoryId?.name || "N/A"}</p>
        <p className="text-sm text-gray-600">Supplier: {product.vendorId?.name || "N/A"}</p>
        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
        <p className="text-sm text-gray-600">Rating: {product.averageRating?.toFixed?.(1) || "0.0"}</p>

        {user?.role === "customer" ? (
          <button
            type="button"
            onClick={handleAddCart}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add to cart
          </button>
        ) : (
          <Link to="/login" className="inline-block rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
            Login as customer to buy
          </Link>
        )}
      </div>
    </section>
  );
}
