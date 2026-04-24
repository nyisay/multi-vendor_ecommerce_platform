import { Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";

const MARKETING_SIGNALS = [
  {
    label: "Campaign cadence",
    value: "Weekly",
    description: "Keep launches, pushes, and seasonal merchandising on a reliable rhythm.",
    surface: "border-rose-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)]",
  },
  {
    label: "Audience mix",
    value: "Segmented",
    description: "Shape the storefront for new shoppers, returning customers, and vendor stories.",
    surface: "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]",
  },
  {
    label: "Merchandising lift",
    value: "+ focus",
    description: "Give featured products, bundles, and landing pages a clearer conversion purpose.",
    surface: "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]",
  },
  {
    label: "Retention story",
    value: "Repeat",
    description: "Balance acquisition excitement with the habits that keep customers coming back.",
    surface: "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]",
  },
];

const CAMPAIGN_AREAS = [
  {
    title: "Acquisition lanes",
    body: "Use the marketing dashboard to decide which product narratives, categories, or vendor spotlights deserve more attention across campaigns and landing surfaces.",
  },
  {
    title: "Conversion clarity",
    body: "Marketing works better when campaign messaging, homepage merchandising, and checkout confidence all feel aligned instead of competing with each other.",
  },
  {
    title: "Retention loops",
    body: "Returning customer energy often comes from clear discovery, trustworthy fulfillment, and consistent follow-up rather than only from discount pressure.",
  },
];

const MARKETING_ACTIONS = [
  {
    title: "Strategic dashboard",
    description: "Compare current campaign energy with the longer-term marketplace direction.",
    to: "/admin/strategic-dashboard",
  },
  {
    title: "Admin products",
    description: "Review assortment and featured inventory that supports active promotions.",
    to: "/admin/products",
  },
  {
    title: "Marketplace about page",
    description: "Check the customer-facing story that explains how the marketplace is positioned.",
    to: "/about",
  },
];

export default function AdminMarketingDashboardPage() {
  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(244,63,94,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.12),_transparent_24%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
            Marketing Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            This dashboard gives the marketplace a stronger campaign lens, covering audience focus,
            merchandising energy, and repeat-customer momentum without changing existing business logic.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MARKETING_SIGNALS.map((card) => (
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
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Campaign focus</p>
            <div className="mt-5 space-y-4">
              {CAMPAIGN_AREAS.map((item, index) => (
                <article
                  key={item.title}
                  className={`rounded-[1.4rem] border p-5 ${
                    index === 0
                      ? "border-rose-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)]"
                      : index === 1
                        ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]"
                        : "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]"
                  }`}
                >
                  <h2 className="text-lg font-black tracking-tight text-slate-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] p-6 text-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.75)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Linked workspaces</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Build momentum across teams</h2>
            <div className="mt-6 space-y-4">
              {MARKETING_ACTIONS.map((item) => (
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
