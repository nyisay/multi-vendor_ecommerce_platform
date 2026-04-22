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
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-4">
        <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">Manage Categories</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Create and view product categories.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-300 focus:bg-amber-50/30 focus:outline-none"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>

        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Recommended category set</h2>
              <p className="text-sm text-slate-600">One click to add the full category list for your storefront.</p>
            </div>
            <button
              type="button"
              onClick={seedRecommended}
              disabled={seeding}
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:opacity-60"
            >
              {seeding ? "Seeding..." : "Seed categories"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {RECOMMENDED_CATEGORIES.slice(0, 18).map((cat) => (
              <span key={cat} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {cat}
              </span>
            ))}
            {RECOMMENDED_CATEGORIES.length > 18 && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                +{RECOMMENDED_CATEGORIES.length - 18} more
              </span>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)]">
          <h2 className="mb-2 text-lg font-bold tracking-tight text-slate-900">Current categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category._id} className="rounded-full border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-3 py-1 text-sm font-medium text-slate-700">
                {category.name}
              </span>
            ))}
            {!categories.length && <p className="text-sm font-medium text-slate-600">No categories yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
