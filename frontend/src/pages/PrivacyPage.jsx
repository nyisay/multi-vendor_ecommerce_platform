import { Link } from "react-router-dom";

const DATA_GROUPS = [
  {
    title: "Account information",
    body: "We use account details such as name, email, contact data, and profile settings to operate accounts and support core marketplace features.",
  },
  {
    title: "Order and checkout data",
    body: "Order history, shipping details, payment method preferences, and fulfillment updates help the marketplace process purchases and support delivery.",
  },
  {
    title: "Usage and improvement signals",
    body: "Basic usage information helps us understand how customers, vendors, and admins move through the platform so the experience can be refined over time.",
  },
];

const DASHBOARD_PRIVACY = [
  {
    title: "Operational dashboard",
    body: "Vendor operational views should surface store activity relevant to the vendor's own products, orders, and day-to-day execution.",
  },
  {
    title: "Strategic dashboard",
    body: "Strategic admin views are intended for marketplace-level planning, using broader performance patterns rather than exposing unnecessary personal detail.",
  },
  {
    title: "Marketing dashboard",
    body: "Marketing views should emphasize campaign trends, merchandising signals, and aggregated engagement patterns that support better decision-making.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-8 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.38)] sm:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Policy</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          PawsieMart uses account, order, and marketplace activity data to operate the platform,
          support transactions, improve the experience, and keep access appropriate for different
          roles. We do not position the marketplace as a place to sell personal information.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {DATA_GROUPS.map((item, index) => (
          <article
            key={item.title}
            className={`rounded-[1.8rem] border p-6 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.28)] ${
              index === 0
                ? "border-amber-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)]"
                : index === 1
                  ? "border-sky-200 bg-[linear-gradient(180deg,_#f0f9ff_0%,_#ffffff_100%)]"
                  : "border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]"
            }`}
          >
            <h2 className="text-xl font-black tracking-tight text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.28)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">How data is used</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
            <p>
              Information collected through the marketplace helps authenticate accounts, process orders,
              support checkout, facilitate fulfillment, personalize parts of the experience, and answer
              support requests more effectively.
            </p>
            <p>
              Some platform improvements also depend on broader usage patterns, such as which surfaces
              customers return to, which vendor workflows need refinement, and which admin views support
              better marketplace decisions.
            </p>
            <p>
              Access should stay role-appropriate. A customer should not see vendor operations data, and
              vendors should not see marketplace-wide admin information beyond what is necessary for their
              own store activity.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] p-6 text-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.75)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Privacy by dashboard</p>
          <div className="mt-5 space-y-4">
            {DASHBOARD_PRIVACY.map((item) => (
              <article key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-black tracking-tight text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-6 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Related pages</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Explore the surrounding policy context
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/terms"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-amber-200 hover:bg-amber-50"
            >
              Terms of service
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-amber-200 hover:bg-amber-50"
            >
              About marketplace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
