import { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { useToast } from "../context/useToast";
import { categoryApi } from "../services/api";

const RECOMMENDED_CATEGORIES = [
  "Electronics",
  "Phones",
  "Laptops",
  "Accessories",
  "Fashion",
  "Men",
  "Women",
  "Kids",
  "Home & Living",
  "Furniture",
  "Kitchen items",
  "Decor",
  "Beauty & Personal Care",
  "Skincare",
  "Makeup",
  "Grooming",
  "Sports & Outdoors",
  "Fitness equipment",
  "Outdoor gear",
  "Toys & Games",
  "Kids toys",
  "Board games",
  "Gaming accessories",
  "Books & Stationery",
  "Books",
  "Office supplies",
];

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

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

  const seedRecommended = async () => {
    setSeeding(true);
    setError("");
    const existing = new Set(categories.map((cat) => String(cat.name || "").trim().toLowerCase()).filter(Boolean));

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const cat of RECOMMENDED_CATEGORIES) {
      const normalized = cat.trim().toLowerCase();
      if (!normalized) continue;
      if (existing.has(normalized)) {
        skipped += 1;
        continue;
      }
      try {
        await categoryApi.create(cat);
        created += 1;
        existing.add(normalized);
      } catch {
        failed += 1;
      }
    }

    await loadCategories();
    showToast(`Seed complete: ${created} created, ${skipped} skipped, ${failed} failed`, failed ? "error" : "success");
    setSeeding(false);
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
            className="rounded bg-[#91ADC2] px-4 py-2 font-semibold text-white transition hover:bg-[#9BA0BC] disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Recommended category set</h2>
              <p className="text-sm text-gray-600">One click to add the full category list for your storefront.</p>
            </div>
            <button
              type="button"
              onClick={seedRecommended}
              disabled={seeding}
              className="rounded bg-[#9BA0BC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7A8B99] disabled:opacity-60"
            >
              {seeding ? "Seeding..." : "Seed categories"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {RECOMMENDED_CATEGORIES.slice(0, 18).map((cat) => (
              <span key={cat} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {cat}
              </span>
            ))}
            {RECOMMENDED_CATEGORIES.length > 18 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                +{RECOMMENDED_CATEGORIES.length - 18} more
              </span>
            )}
          </div>
        </div>

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
