import { Link } from "react-router-dom";

const MARKETPLACE_PILLARS = [
  {
    title: "Curated discovery",
    body: "PawsieMart is designed to feel selective rather than overwhelming, helping customers move from browse to confidence with less noise.",
  },
  {
    title: "Independent seller growth",
    body: "The marketplace gives vendors a cleaner space to launch products, manage day-to-day operations, and build trust through consistency.",
  },
  {
    title: "Shared visibility",
    body: "Customers, vendors, and admins each get workspace views that support their role without changing the core marketplace flow behind the scenes.",
  },
];

const DASHBOARD_SPACES = [
  {
    title: "Operational dashboard",
    audience: "Vendor",
    description: "A day-to-day control surface for fulfillment, inventory attention, and storefront upkeep.",
    to: "/vendor/operational-dashboard",
  },
  {
    title: "Strategic dashboard",
    audience: "Admin",
    description: "A higher-level view for growth direction, vendor quality, and category planning.",
    to: "/admin/strategic-dashboard",
  },
  {
    title: "Marketing dashboard",
    audience: "Admin",
    description: "A campaign-focused workspace for audience energy, merchandising, and repeat-customer momentum.",
    to: "/admin/marketing-dashboard",
  },
];

const MARKETPLACE_FLOW = [
  {
    step: "01",
    title: "Customers discover with more confidence",
    body: "The storefront emphasizes curated search, strong product presentation, and repeatable shopping paths instead of clutter.",
  },
  {
    step: "02",
    title: "Vendors manage real operations",
    body: "Sellers get a practical workspace for products, orders, and daily operating rhythm while keeping the catalog consistent for shoppers.",
  },
  {
    step: "03",
    title: "Admins keep the marketplace balanced",
    body: "Admin tools help monitor performance, guide growth, and make sure the marketplace keeps scaling in a healthy direction.",
  },
];

export default function AboutPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-8 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.38)] sm:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">About marketplace</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
          About PawsieMart
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          PawsieMart is a multi-vendor marketplace built to make discovery feel more curated, selling
          feel more organized, and marketplace oversight feel more intentional. Customers get a cleaner
          shopping journey, vendors get stronger day-to-day tools, and admins get clearer control over
          how the platform grows.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse products
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-amber-200 hover:bg-amber-50"
          >
            Open dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MARKETPLACE_PILLARS.map((pillar, index) => (
          <article
            key={pillar.title}
            className={`rounded-[1.8rem] border p-6 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.28)] ${
              index === 0
                ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]"
                : index === 1
                  ? "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]"
                  : "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]"
            }`}
          >
            <h2 className="text-xl font-black tracking-tight text-slate-950">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{pillar.body}</p>
          </article>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Marketplace dashboards</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
              Purpose-built views for each role
            </h2>
          </div>
          <Link to="/privacy" className="text-sm font-semibold text-slate-900 transition hover:text-amber-700">
            Review privacy practices
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {DASHBOARD_SPACES.map((item, index) => (
            <Link
              key={item.title}
              to={item.to}
              className={`rounded-[1.6rem] border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.3)] ${
                index === 0
                  ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]"
                  : index === 1
                    ? "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]"
                    : index === 2
                      ? "border-rose-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)]"
                      : "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{item.audience}</p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] p-6 text-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.75)] sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">How it works</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {MARKETPLACE_FLOW.map((item) => (
            <article key={item.step} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">{item.step}</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
