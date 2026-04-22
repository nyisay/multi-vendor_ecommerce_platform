export default function TermsPage() {
  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-8 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.38)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Policy</p>
      <h1 className="text-3xl font-black tracking-[-0.03em] text-slate-950">Terms of Service</h1>
      <p className="text-sm leading-7 text-slate-700">
        By using MultiVendor, you agree to provide accurate account information and follow local laws when buying or selling.
      </p>
      <p className="text-sm leading-7 text-slate-700">
        Sellers are responsible for accurate product listings and fulfillment. Customers are responsible for reviewing product
        details before placing an order.
      </p>
    </section>
  );
}
