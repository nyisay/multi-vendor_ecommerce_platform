import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { categoryApi } from "../services/api";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      try {
        const data = await categoryApi.getAll();
        if (!cancelled) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    };
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await categoryApi.create(name);
      showToast("Category created", "success");
      setName("");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-sm text-gray-600">Create and view product categories.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-gray-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900">Current categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category._id} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {category.name}
              </span>
            ))}
            {!categories.length && <p className="text-sm text-gray-600">No categories yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
