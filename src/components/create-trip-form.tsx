"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Luggage, MapPin, Minus, Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { LUGGAGE_SIZE_OPTIONS, MATCHING_SCOPE_LABELS, type MatchingScope } from "@/lib/constants";
import { cn } from "@/lib/utils";

const flexOptions = [0, 15, 30, 60];
const deadlineOptions = [30, 60, 90, 120];

export function CreateTripForm({ schoolName }: { schoolName: string }) {
  const router = useRouter();
  const [origin, setOrigin] = useState("浦东国际机场");
  const [destination, setDestination] = useState(schoolName);
  const [departureDate, setDepartureDate] = useState("2026-09-20");
  const [departureTime, setDepartureTime] = useState("18:00");
  const [flexibility, setFlexibility] = useState(30);
  const [minMembers, setMinMembers] = useState(2);
  const [maxMembers, setMaxMembers] = useState(3);
  const [luggageCount, setLuggageCount] = useState(1);
  const [luggageSizes, setLuggageSizes] = useState(["24寸左右"]);
  const [oversized, setOversized] = useState(false);
  const [scope, setScope] = useState<MatchingScope>("SCHOOL");
  const [deadline, setDeadline] = useState(60);
  const [loading, setLoading] = useState(false);

  const sizes = useMemo(() => Array.from({ length: luggageCount }, (_, index) => luggageSizes[index] ?? "24寸左右"), [luggageCount, luggageSizes]);

  function changeCount(next: number) {
    const value = Math.max(0, Math.min(8, next));
    setLuggageCount(value);
    setLuggageSizes((current) => Array.from({ length: value }, (_, index) => current[index] ?? "24寸左右"));
  }

  function setSize(index: number, size: string) {
    setLuggageSizes((current) => {
      const next = [...current];
      next[index] = size;
      return next;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (minMembers >= maxMembers) {
      toast.error("最低成团人数必须小于最大人数");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          departureTime,
          timeFlexibilityMinutes: flexibility,
          minMembers,
          maxMembers,
          luggageCount,
          luggageSizes: sizes,
          hasOversizedLuggage: oversized,
          matchingScope: scope,
          deadlineMinutesBeforeDeparture: deadline,
        }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      toast.success("拼车已发布，正在寻找同行者");
      router.push(`/trips/${data.trip.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "发布失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="surface p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-700"><MapPin className="size-5" /></span>
          <div><h2 className="font-black text-ink">基本信息</h2><p className="text-xs text-slate-500">日期仅支持未来 3 天内</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="label">出发地</span><Input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="浦东国际机场" required /></label>
          <label><span className="label">目的地</span><Input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="XX大学" required /></label>
          <label><span className="label">出发日期</span><Input type="date" min="2026-09-20" max="2026-09-23" value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} required /></label>
          <label><span className="label">出发时间</span><Input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} required /></label>
        </div>
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Clock3 className="size-5" /></span>
          <div><h2 className="font-black text-ink">时间弹性</h2><p className="text-xs text-slate-500">允许同行者与计划时间存在一定偏差</p></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {flexOptions.map((option) => (
            <button type="button" key={option} onClick={() => setFlexibility(option)} className={cn("rounded-2xl border px-3 py-3 text-sm font-semibold transition", flexibility === option ? "border-brand-500 bg-brand-50 text-brand-800" : "border-black/10 bg-white text-slate-600 hover:border-brand-200")}>
              {option === 0 ? "不接受偏差" : `±${option}分钟`}
            </button>
          ))}
        </div>
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Users className="size-5" /></span>
          <div><h2 className="font-black text-ink">人数设置</h2><p className="text-xs text-slate-500">当前你会计入总人数</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <span className="label">当前人数</span>
            <div className="flex h-12 items-center justify-center rounded-2xl bg-slate-50 px-4 font-black text-ink">1 人</div>
          </div>
          <label>
            <span className="label">最低成团人数</span>
            <Select value={minMembers} onChange={(event) => setMinMembers(Number(event.target.value))}>
              {[2, 3, 4, 5].map((count) => <option key={count} value={count}>{count} 人</option>)}
            </Select>
          </label>
          <label>
            <span className="label">最大人数</span>
            <Select value={maxMembers} onChange={(event) => setMaxMembers(Number(event.target.value))}>
              {[2, 3, 4, 5, 6].map((count) => <option key={count} value={count} disabled={count <= minMembers}>{count} 人</option>)}
            </Select>
          </label>
        </div>
        <p className="mt-3 rounded-2xl bg-brand-50 px-4 py-3 text-xs font-medium text-brand-800">你希望：至少拼 {minMembers - 1} 人，最多拼 {maxMembers - 1} 人。</p>
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Luggage className="size-5" /></span>
          <div><h2 className="font-black text-ink">行李信息</h2><p className="text-xs text-slate-500">帮助下一位同行者判断空间是否合适</p></div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
          <div><p className="text-sm font-bold text-ink">行李数量</p><p className="mt-1 text-xs text-slate-500">支持 0～8 件</p></div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" onClick={() => changeCount(luggageCount - 1)} disabled={luggageCount === 0}><Minus className="size-4" /></Button>
            <span className="w-8 text-center text-lg font-black">{luggageCount}</span>
            <Button type="button" variant="outline" size="icon" onClick={() => changeCount(luggageCount + 1)} disabled={luggageCount === 8}><Plus className="size-4" /></Button>
          </div>
        </div>
        {sizes.length > 0 && (
          <div className="mt-4 space-y-3">
            {sizes.map((size, index) => (
              <div key={index} className="grid grid-cols-[5rem_1fr] items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">行李 {index + 1}</span>
                <Select value={size} onChange={(event) => setSize(index, event.target.value)}>{LUGGAGE_SIZE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</Select>
              </div>
            ))}
          </div>
        )}
        <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-black/5 p-4">
          <div><p className="text-sm font-bold text-ink">是否有超大件</p><p className="mt-1 text-xs text-slate-500">如乐器、超尺寸行李箱等</p></div>
          <input type="checkbox" checked={oversized} onChange={(event) => setOversized(event.target.checked)} className="size-5 accent-brand-600" />
        </label>
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-700"><ShieldCheck className="size-5" /></span>
          <div><h2 className="font-black text-ink">匹配范围</h2><p className="text-xs text-slate-500">扩大范围可以提高成功率</p></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["SCHOOL", "CITY", "ALL"] as MatchingScope[]).map((item) => (
            <button type="button" key={item} onClick={() => setScope(item)} className={cn("rounded-3xl border p-4 text-left transition", scope === item ? "border-brand-500 bg-brand-50" : "border-black/10 bg-white hover:border-brand-200")}>
              <p className="font-bold text-ink">{MATCHING_SCOPE_LABELS[item]}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item === "SCHOOL" ? "优先找同校同学，信任基础更强。" : item === "CITY" ? "加入同城高校学生，提高拼车成功率。" : "接受所有高校学生，匹配范围最大。"}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="font-black text-ink">单独出行截止时间</h2>
          <p className="mt-1 text-xs text-slate-500">出发前多久停止等待拼车？未成团会自动切换到单独出行模式。</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {deadlineOptions.map((option) => (
            <button type="button" key={option} onClick={() => setDeadline(option)} className={cn("rounded-2xl border px-3 py-3 text-sm font-semibold transition", deadline === option ? "border-brand-500 bg-brand-50 text-brand-800" : "border-black/10 text-slate-600")}>出发前 {option} 分钟</button>
          ))}
        </div>
      </section>

      <div className="sticky bottom-24 z-20 rounded-3xl border border-black/5 bg-white/95 p-3 shadow-float backdrop-blur md:bottom-4">
        <Button type="submit" size="lg" className="w-full" loading={loading}>发布拼车 <ArrowRight className="size-4" /></Button>
        <p className="mt-2 text-center text-[11px] text-slate-400">发布即表示你同意仅在 Demo 中展示该校验行程。</p>
      </div>
    </form>
  );
}
