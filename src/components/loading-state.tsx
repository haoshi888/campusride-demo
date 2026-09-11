export function LoadingState({ label = "正在加载…" }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm font-medium text-slate-500">
      <span className="size-7 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      {label}
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="surface animate-pulse p-5">
      <div className="h-4 w-28 rounded-full bg-slate-100" />
      <div className="mt-5 h-6 w-3/4 rounded-lg bg-slate-100" />
      <div className="mt-3 h-5 w-1/2 rounded-lg bg-slate-100" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
