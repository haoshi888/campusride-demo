import Link from "next/link";
import { ArrowLeftRight, Info, SlidersHorizontal } from "lucide-react";
import type { Trip, User, School } from "@prisma/client";
import { TripCard } from "@/components/trip-card";
import type { MatchResult } from "@/lib/matching";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import type { MatchingScope } from "@/lib/constants";

type MatchItem = {
  trip: Trip & { creator: User; school: School; members?: { userId: string }[] };
  score: number;
  level: number;
  label: "高匹配" | "中匹配" | "跨校匹配" | "可考虑";
  breakdown: MatchResult["breakdown"];
  reasons: string[];
  timeDiffMinutes: number;
};

export function MatchingResults({
  matches,
  now,
  scope,
  baseParams,
}: {
  matches: MatchItem[];
  now: Date;
  scope: MatchingScope;
  baseParams: Record<string, string>;
}) {
  function scopeHref(next: MatchingScope) {
    const params = new URLSearchParams(baseParams);
    params.set("scope", next);
    return `/search?${params.toString()}`;
  }

  if (!matches.length) {
    return (
      <div className="space-y-4">
        <EmptyState title="没有找到合适的拼车。" description="可以尝试调整时间、扩大匹配范围，或发布一条自己的行程。" actionLabel="发布拼车" actionHref="/trips/create" />
        <div className="flex flex-wrap justify-center gap-3">
          {scope === "SCHOOL" && <Link href={scopeHref("CITY")}><Button variant="outline"><ArrowLeftRight className="size-4" />扩大到同城高校</Button></Link>}
          {scope !== "ALL" && <Link href={scopeHref("ALL")}><Button variant="outline">扩大到所有高校</Button></Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-brand-100 bg-brand-50/70 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-brand-700" />
          <div>
            <p className="text-sm font-bold text-brand-900">规则匹配，不使用 AI 黑盒</p>
            <p className="mt-1 text-xs leading-5 text-brand-800/70">按学校 45%、路线 30%、时间 20%、行李与余位综合排序。</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["SCHOOL", "CITY", "ALL"] as MatchingScope[]).map((item) => (
            <Link key={item} href={scopeHref(item)}>
              <Button size="sm" variant={scope === item ? "primary" : "outline"}>{item === "SCHOOL" ? "同校" : item === "CITY" ? "同城" : "全部"}</Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <div key={match.trip.id} className="space-y-2">
            <TripCard trip={match.trip} now={now} match={match} />
            <div className="flex flex-wrap gap-2 px-1 text-[11px] font-semibold text-slate-500">
              <span className="rounded-full bg-white px-2.5 py-1">学校 {match.breakdown.schoolScore}</span>
              <span className="rounded-full bg-white px-2.5 py-1">路线 {match.breakdown.routeScore}</span>
              <span className="rounded-full bg-white px-2.5 py-1">时间 {match.breakdown.timeScore}</span>
              <span className="rounded-full bg-white px-2.5 py-1">行李 {match.breakdown.luggageScore}</span>
              <span className="rounded-full bg-white px-2.5 py-1">余位 {match.breakdown.capacityScore}</span>
            </div>
          </div>
        ))}
      </div>
      {scope !== "ALL" && (
        <div className="surface flex flex-col items-center justify-between gap-4 p-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="size-5 text-brand-600" />
            <div>
              <p className="font-bold text-ink">结果不够多？</p>
              <p className="mt-1 text-sm text-slate-500">扩大范围可能提升成功率，但同校匹配通常更容易建立信任。</p>
            </div>
          </div>
          <Link href={scopeHref(scope === "SCHOOL" ? "CITY" : "ALL")}><Button variant="outline">{scope === "SCHOOL" ? "扩大到同城高校" : "扩大到所有高校"}</Button></Link>
        </div>
      )}
    </div>
  );
}

