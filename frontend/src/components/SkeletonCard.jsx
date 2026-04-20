export default function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="h-32 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="h-3 w-1/2 rounded bg-gray-200" />
      <div className="h-3 w-1/3 rounded bg-gray-200" />
    </div>
  );
}
