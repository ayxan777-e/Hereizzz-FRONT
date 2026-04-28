export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 h-36 rounded-xl bg-white/10" />
      <div className="mb-3 h-4 rounded-full bg-white/15" />
      <div className="h-4 w-1/2 rounded-full bg-white/10" />
    </div>
  );
}