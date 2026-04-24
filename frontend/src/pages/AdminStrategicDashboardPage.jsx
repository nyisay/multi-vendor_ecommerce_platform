import { Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";

const STRATEGIC_SIGNALS = [
  {
    label: "Growth horizon",
    value: "12 mo",
    description: "Frame the marketplace around longer-term expansion instead of daily noise.",
    surface: "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]",
  },
  {
    label: "Vendor quality",
    value: "Tiered",
    description: "Balance acquisition volume with consistency, fulfillment quality, and retention.",
    surface: "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]",
  },
  {
    label: "Category bets",
    value: "Prioritized",
    description: "Identify where new assortment depth can create stronger differentiation.",
    surface: "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]",
  },
  {
    label: "Risk review",
    value: "Monthly",
    description: "Keep governance, policy quality, and concentration risk visible to decision makers.",
    surface: "border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]",
  },
];

const STRATEGIC_AREAS = [
  {
    title: "Marketplace shape",
    body: "A strategic dashboard helps admins decide whether the platform is broadening well across categories and vendors or simply growing in a way that becomes harder to manage later.",
  },
  {
    title: "Investment focus",
    body: "Promotions, merchandising time, onboarding effort, and quality control all work better when they are guided by a clear view of what deserves more support.",
  },
  {
    title: "Leadership rhythm",
    body: "This view acts as the higher-level companion to day-to-day admin work, making it easier to communicate why certain priorities matter.",
  },
];

const ADMIN_ACTIONS = [
  {
    title: "Admin overview",
    description: "Return to the main admin dashboard for marketplace totals and live analytics.",
    to: "/admin/dashboard",
  },
  {
    title: "Marketing dashboard",
    description: "Compare strategic bets with campaign momentum and conversion focus.",
    to: "/admin/marketing-dashboard",
  },
  {
    title: "Manage vendors",
    description: "Review the seller base that powers long-term marketplace quality.",
    to: "/admin/vendors",
  },
];

export default function AdminStrategicDashboardPage() {
  return (
    <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
      <DashboardSidebar role="admin" />
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.15),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_22px_60px_-46px_rgba(15,23,42,0.42)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
            Strategic Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            This dashboard is designed for longer-horizon thinking across growth, vendor mix, category
            depth, and operational risk, while leaving the underlying application behavior exactly as-is.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STRATEGIC_SIGNALS.map((card) => (
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
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Decision lenses</p>
            <div className="mt-5 space-y-4">
              {STRATEGIC_AREAS.map((item, index) => (
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
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Linked workspaces</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Keep strategy connected</h2>
            <div className="mt-6 space-y-4">
              {ADMIN_ACTIONS.map((item) => (
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
