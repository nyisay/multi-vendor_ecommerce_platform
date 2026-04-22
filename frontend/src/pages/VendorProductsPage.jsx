import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { categoryApi, getImageUrl, productApi } from "../services/api";

const initialForm = {
  name: "",
  price: "",
  stock: "",
  categoryId: "",
  description: "",
};

export default function VendorProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMyProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productApi.getMine();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load vendor products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInit = async () => {
      await loadMyProducts();
      try {
        const categoryData = await categoryApi.getAll();
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch {
        setCategories([]);
      }
    };
    loadInit();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
    setImageFile(null);
    setRemoveImage(false);
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId,
        description: form.description,
        ...(imageFile ? { image: imageFile } : {}),
        ...(removeImage ? { removeImage: "true" } : {}),
      };

      if (editingId) {
        await productApi.updateWithImage(editingId, payload);
        showToast("Product updated", "success");
      } else {
        await productApi.createWithImage(payload);
        showToast("Product created", "success");
      }

      resetForm();
      await loadMyProducts();
    } catch (err) {
      setError(err.message || "Failed to save product");
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      price: product.price || "",
      stock: product.stock || "",
      categoryId: product.categoryId?._id || "",
      description: product.description || "",
    });
    setImageFile(null);
    setRemoveImage(false);
  };

  const deleteProduct = async (productId) => {
    setError("");
    try {
      await productApi.remove(productId);
      showToast("Product deleted", "success");
      await loadMyProducts();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="vendor" />
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Vendor Product Management</h1>
          <p className="text-sm font-medium text-slate-600">Add, edit, and manage your own products with images.</p>
        </div>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={submitCreate} className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)] md:grid-cols-2">
          <input
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={onChange}
            required
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={onChange}
            required
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <input
            name="stock"
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={onChange}
            required
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={onChange}
            required
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={onChange}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none md:col-span-2"
            rows={3}
          />
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Product image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
            />
            {editingId && (
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(event) => setRemoveImage(event.target.checked)}
                />
                Remove current image
              </label>
            )}
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
              {editingId ? "Update Product" : "Create Product"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {loading && <p className="text-sm font-semibold text-slate-600">Loading your products...</p>}

        <div className="space-y-3">
          {products.map((product) => (
            <article key={product._id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)]">
              <div className="flex items-center gap-3">
                {product.imageUrl ? (
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-slate-200" />
                )}
                <div>
                  <h2 className="font-semibold text-slate-900">{product.name}</h2>
                  <p className="text-sm text-slate-600">
                    ${product.price} | Stock: {product.stock}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteProduct(product._id)}
                  className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
