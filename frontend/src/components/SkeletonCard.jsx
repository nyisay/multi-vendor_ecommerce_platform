export default function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_18px_48px_-40px_rgba(15,23,42,0.42)]">
      <div className="h-56 bg-[linear-gradient(135deg,_#fff7e7,_#f8fafc_48%,_#dbeafe)]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded bg-amber-100" />
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
