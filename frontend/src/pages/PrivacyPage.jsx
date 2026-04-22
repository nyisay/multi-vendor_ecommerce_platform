export default function PrivacyPage() {
  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] p-8 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.38)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Policy</p>
      <h1 className="text-3xl font-black tracking-[-0.03em] text-slate-950">Privacy Policy</h1>
      <p className="text-sm leading-7 text-slate-700">
        We collect account, order, and basic usage information to operate the marketplace and improve your shopping experience.
      </p>
      <p className="text-sm leading-7 text-slate-700">
        We do not sell personal information. Data is used for order processing, account security, and support operations.
      </p>
    </section>
  );
}
