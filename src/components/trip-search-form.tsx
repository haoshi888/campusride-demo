"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Clock3, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TripSearchForm({
  variant = "default",
  defaults,
}: {
  variant?: "default" | "hero";
  defaults?: { origin?: string; destination?: string; date?: string; time?: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["origin", "destination", "date", "time"]) {
      const value = String(form.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    setLoading(true);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className={variant === "hero" ? "rounded-3xl border border-white/80 bg-white/95 p-3 shadow-float backdrop-blur sm:p-4" : "surface p-4"}>
      <div className="grid gap-3 md:grid-cols-4">
        <label className="relative">
          <span className="sr-only">出发地</span>
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-600" />
          <input name="origin" defaultValue={defaults?.origin ?? "浦东国际机场"} placeholder="出发地" className="field pl-10" />
        </label>
        <label className="relative">
          <span className="sr-only">目的地</span>
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-coral-500" />
          <input name="destination" defaultValue={defaults?.destination ?? "XX大学"} placeholder="目的地" className="field pl-10" />
        </label>
        <label className="relative">
          <span className="sr-only">日期</span>
          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input name="date" type="date" defaultValue={defaults?.date ?? "2026-09-20"} className="field pl-10" />
        </label>
        <label className="relative">
          <span className="sr-only">时间</span>
          <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input name="time" type="time" defaultValue={defaults?.time ?? "18:00"} className="field pl-10" />
        </label>
      </div>
      <Button type="submit" size="lg" loading={loading} className="mt-3 w-full">
        <Search className="size-4" /> 搜索拼车
      </Button>
    </form>
  );
}
