import { Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";

const SIGNAL_CARDS = [
  {
    label: "Fulfillment focus",
    value: "Today",
    description: "Prioritize new orders, shipping readiness, and customer response windows.",
    surface: "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]",
  },
  {
    label: "Inventory watch",
    value: "Low-stock",
    description: "Highlight products that need replenishment planning before they stall sales.",
    surface: "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]",
  },
  {
    label: "Service pace",
    value: "< 24h",
    description: "Keep response and packing routines tight enough to protect customer trust.",
    surface: "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]",
  },
  {
    label: "Storefront upkeep",
    value: "Active",
    description: "Refresh pricing, descriptions, and featured products so the catalog stays sharp.",
    surface: "border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]",
  },
];

const OPERATIONS_AREAS = [
  {
    title: "Daily order rhythm",
    body: "Use the operational dashboard to treat order review, dispatch preparation, and post-purchase follow-up as one continuous workflow.",
  },
  {
    title: "Inventory confidence",
    body: "Storefront quality depends on active stock visibility. This view keeps product upkeep and sell-through pacing connected.",
  },
  {
    title: "Customer experience",
    body: "Fast handling, accurate listings, and clear fulfillment expectations protect review quality and reduce support friction.",
  },
];

const ACTION_LINKS = [
  {
    title: "Vendor dashboard",
    description: "Return to your live revenue, order, and product totals.",
    to: "/vendor/dashboard",
  },
  {
    title: "Manage products",
    description: "Update listings, pricing, and stock before operational bottlenecks grow.",
    to: "/vendor/products",
  },
  {
    title: "Review orders",
    description: "Open the full vendor orders workspace to process the next queue.",
    to: "/vendor/orders",
  },
];

export default function VendorOperationalDashboardPage() {
  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="vendor" />
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Vendor workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
            Operational Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            This view is focused on day-to-day execution: keeping orders moving, inventory current,
            and the storefront reliable without changing the marketplace logic behind it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SIGNAL_CARDS.map((card) => (
            <article
              key={card.label}
              className={`rounded-[1.7rem] border p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.35)] ${card.surface}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{card.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.3)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Operations playbook</p>
            <div className="mt-5 space-y-4">
              {OPERATIONS_AREAS.map((item, index) => (
                <article
                  key={item.title}
                  className={`rounded-[1.4rem] border p-5 ${
                    index === 0
                      ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]"
                      : index === 1
                        ? "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]"
                        : "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]"
                  }`}
                >
                  <h2 className="text-lg font-black tracking-tight text-slate-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] p-6 text-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.75)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Next actions</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Move from signal to action</h2>
            <div className="mt-6 space-y-4">
              {ACTION_LINKS.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="block rounded-[1.4rem] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <p className="text-lg font-black tracking-tight text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
