export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="h-10 w-52 animate-pulse rounded-2xl bg-white/70" />
      <div className="h-40 animate-pulse rounded-3xl bg-white/70" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-white/70" />)}
      </div>
    </div>
  );
}
