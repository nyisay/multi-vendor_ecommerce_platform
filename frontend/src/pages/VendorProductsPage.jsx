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
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
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
    setNewImageFiles([]);
    setExistingImageUrls([]);
  };

  const onFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const totalCurrentImages = newImageFiles.length + existingImageUrls.length;
    
    if (totalCurrentImages + files.length > 4) {
      showToast("Maximum 4 images allowed", "error");
      return;
    }
    
    setNewImageFiles((prev) => [...prev, ...files]);
    // Clear input so same file can be selected again if removed
    event.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setExistingImageUrls((prev) => prev.filter((img) => img !== url));
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
        images: newImageFiles,
      };

      if (editingId) {
        // When editing, we also need to tell the backend which existing images to keep
        payload.keepImages = existingImageUrls;
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
    setNewImageFiles([]);
    setExistingImageUrls(product.imageUrls || (product.imageUrl ? [product.imageUrl] : []));
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
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Vendor workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Vendor Product Management</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Add, edit, and manage your own products with images.</p>
        </div>

        {error && <p className="rounded-xl border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-3 py-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={submitCreate} className="grid gap-3 rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)] md:grid-cols-2">
          <input
            name="name"
            placeholder="Product name"
            value={form.name}
            onChange={onChange}
            required
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-300 focus:bg-amber-50/30 focus:outline-none"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-300 focus:bg-amber-50/30 focus:outline-none"
          />
          <input
            name="stock"
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={onChange}
            required
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-300 focus:bg-amber-50/30 focus:outline-none"
          />
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={onChange}
            required
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-300 focus:bg-amber-50/30 focus:outline-none"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-300 focus:bg-amber-50/30 focus:outline-none md:col-span-2"
            rows={3}
          />
          <div className="space-y-3 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Product images (Max 4)</label>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Existing Images */}
              {existingImageUrls.map((url, idx) => (
                <div key={`existing-${idx}`} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img src={getImageUrl(url)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ×
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-slate-900/50 px-1 text-[10px] text-white">Current</span>
                </div>
              ))}

              {/* New Image Previews */}
              {newImageFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="group relative aspect-square overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
                  <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ×
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-amber-600/80 px-1 text-[10px] text-white">New</span>
                </div>
              ))}

              {/* Upload Button */}
              {(existingImageUrls.length + newImageFiles.length) < 4 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-amber-400 hover:bg-amber-50">
                  <span className="text-2xl text-slate-400">+</span>
                  <span className="text-[10px] font-semibold text-slate-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              {editingId ? "Update Product" : "Create Product"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {loading && <p className="text-sm font-semibold text-slate-600">Loading your products...</p>}

        <div className="space-y-3">
          {products.map((product) => (
            <article key={product._id} className="flex items-center justify-between rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)]">
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
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteProduct(product._id)}
                  className="rounded-full bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
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
