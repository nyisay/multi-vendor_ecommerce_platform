export default function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-10 w-full rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
