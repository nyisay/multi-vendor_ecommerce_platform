import { Link } from "react-router-dom";

const TERMS_SECTIONS = [
  {
    title: "Account accuracy",
    body: "Users should provide current and truthful account details so orders, support conversations, and dashboard access remain reliable across the marketplace.",
  },
  {
    title: "Seller responsibility",
    body: "Vendors are expected to keep listings accurate, pricing current, and fulfillment expectations clear. Product content should reflect what customers will actually receive.",
  },
  {
    title: "Buyer responsibility",
    body: "Customers should review product details, pricing, and delivery information before checkout, and use marketplace tools in good faith.",
  },
];

const DASHBOARD_ACCESS = [
  {
    title: "Operational dashboard",
    body: "Vendor-facing operational views are intended for managing catalog quality, order readiness, and storefront execution.",
  },
  {
    title: "Strategic dashboard",
    body: "Admin-facing strategic views support planning, marketplace stewardship, and responsible growth decisions.",
  },
  {
    title: "Marketing dashboard",
    body: "Admin-facing marketing views help coordinate campaigns, merchandising, and customer engagement priorities.",
  },
];

export default function TermsPage() {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.12),_transparent_28%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-8 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.38)] sm:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Policy</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
          These terms describe the baseline expectations for using PawsieMart as a customer, vendor,
          or admin. They are meant to keep the marketplace trustworthy, functional, and fair for every
          role that depends on it.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TERMS_SECTIONS.map((item, index) => (
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
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Use of the service</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
            <p>
              Marketplace accounts and dashboards should only be used for legitimate shopping,
              selling, administration, and support-related activity. Attempts to abuse platform
              access, misrepresent listings, or interfere with other users are outside acceptable use.
            </p>
            <p>
              Orders, pricing, listings, and account tools are provided to support real marketplace
              activity. Vendors remain responsible for the accuracy of their products and fulfillment,
              while customers remain responsible for reviewing what they purchase before placing an order.
            </p>
            <p>
              Admin tools and dashboards are provided for marketplace oversight and operations. Access
              should be used with care, especially where policies, user management, or platform-wide
              changes could affect other participants.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] p-6 text-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.75)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Dashboard access</p>
          <div className="mt-5 space-y-4">
            {DASHBOARD_ACCESS.map((item) => (
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
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Related policies</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Review supporting policy pages
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/privacy"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-amber-200 hover:bg-amber-50"
            >
              Privacy policy
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
