import { CalendarDays, SlidersHorizontal } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDemoNow } from "@/lib/demo-time";
import { findMatchingTrips } from "@/services/matchingService";
import { searchTrips } from "@/services/tripService";
import { TripSearchForm } from "@/components/trip-search-form";
import { MatchingResults } from "@/components/matching-results";
import { TripCard } from "@/components/trip-card";
import { EmptyState } from "@/components/empty-state";
import type { MatchingScope } from "@/lib/constants";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function value(params: Record<string, string | string[] | undefined>, key: string, fallback = "") {
  const item = params[key];
  return Array.isArray(item) ? item[0] ?? fallback : item ?? fallback;
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const now = await getDemoNow();
  const origin = value(params, "origin", "浦东国际机场");
  const destination = value(params, "destination", "XX大学");
  const date = value(params, "date", "2026-09-20");
  const time = value(params, "time", "18:00");
  const scope = (value(params, "scope", "SCHOOL") as MatchingScope);
  const baseParams = { origin, destination, date, time };

  const matches = user
    ? await findMatchingTrips(user, { origin, destination, date, time, scope, flexibilityMinutes: 30 })
    : [];
  const guestTrips = user ? [] : await searchTrips({ origin, destination, date, time, limit: 12 });

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">查找同行者</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">搜索拼车</h1>
          <p className="mt-2 text-sm text-slate-500">输入路线与时间，系统按学校、路线、时间和行李需求综合匹配。</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">
          <CalendarDays className="size-4 text-brand-600" /> Demo 当前时间 {new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(now)}
        </div>
      </div>

      <TripSearchForm defaults={{ origin, destination, date, time }} />

      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <SlidersHorizontal className="size-4" />
        {user ? `已按 ${scope === "SCHOOL" ? "同校优先" : scope === "CITY" ? "同城高校" : "所有高校"} 完成规则匹配` : "登录后可查看个性化匹配分与标签"}
      </div>

      {user ? (
        <MatchingResults matches={matches} now={now} scope={scope} baseParams={baseParams} />
      ) : guestTrips.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guestTrips.map((trip) => <TripCard key={trip.id} trip={trip} now={now} />)}
        </div>
      ) : (
        <EmptyState title="暂无符合条件的拼车。" description="登录后可查看个性化匹配分，或主动发布拼车，让同路同学找到你。" actionLabel="发布拼车" actionHref="/trips/create" />
      )}
    </div>
  );
}
