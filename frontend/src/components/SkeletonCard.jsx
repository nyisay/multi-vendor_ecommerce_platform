export default function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)]">
      <div className="h-56 bg-gradient-to-br from-slate-100 to-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
