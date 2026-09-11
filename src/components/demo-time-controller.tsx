"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DemoTimeController({ initialOffset = 0 }: { initialOffset?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, setLoading] = useState(false);

  async function advance(minutes: number) {
    setLoading(true);
    try {
      const response = await fetch("/api/demo/time", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offsetMinutes: minutes }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      const next = offset + minutes;
      setOffset(next);
      toast.success(`Demo 时间已快进 ${minutes} 分钟`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "时间快进失败");
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setLoading(true);
    await fetch("/api/demo/time", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset: true }) });
    setOffset(0);
    setLoading(false);
    toast.success("已恢复 Demo 初始时间");
    router.refresh();
  }

  const now = new Date(new Date("2026-09-20T17:00:00+08:00").getTime() + offset * 60_000);
  const display = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);

  return (
    <div className="fixed bottom-24 right-3 z-40 md:bottom-5 md:right-5">
      {open ? (
        <div className="w-72 rounded-3xl border border-black/5 bg-white p-4 shadow-float">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Demo 时间控制器</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">当前：{display}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)}><X className="size-4" /></Button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[10, 30, 60].map((minutes) => (
              <Button key={minutes} size="sm" variant="outline" onClick={() => advance(minutes)} loading={loading}>+{minutes}分</Button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={reset}><RotateCcw className="size-4" />恢复初始时间</Button>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">点击后会重新计算 FORMING、CONFIRMED、DEPARTURE_PENDING 与 SOLO_MODE。</p>
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} className="h-12 rounded-2xl shadow-float">
          <Clock3 className="size-4" /> Demo 时间
          {offset > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">+{offset}分</span>}
        </Button>
      )}
    </div>
  );
}

