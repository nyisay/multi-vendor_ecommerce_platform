export default function AboutPage() {
  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-8 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.38)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">About</p>
      <h1 className="text-3xl font-black tracking-[-0.03em] text-slate-950">About MultiVendor</h1>
      <p className="text-sm leading-7 text-slate-700">
        MultiVendor is an online marketplace that connects shoppers with trusted independent sellers across categories.
      </p>
      <p className="text-sm leading-7 text-slate-700">
        Our platform is designed to make product discovery, checkout, and order tracking simple for customers while giving
        sellers tools to manage inventory and fulfillment efficiently.
      </p>
    </section>
  );
}
