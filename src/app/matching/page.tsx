import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { findMatchingTrips } from "@/services/matchingService";
import { getDemoNow } from "@/lib/demo-time";
import { MatchingResults } from "@/components/matching-results";
import { TripSearchForm } from "@/components/trip-search-form";
import type { MatchingScope } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MatchingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/matching");
  const params = await searchParams;
  const read = (key: string, fallback: string) => {
    const item = params[key];
    return (Array.isArray(item) ? item[0] : item) ?? fallback;
  };
  const origin = read("origin", "浦东国际机场");
  const destination = read("destination", "XX大学");
  const date = read("date", "2026-09-20");
  const time = read("time", "18:00");
  const scope = read("scope", "SCHOOL") as MatchingScope;
  const now = await getDemoNow();
  const matches = await findMatchingTrips(user, { origin, destination, date, time, scope, flexibilityMinutes: 30 });

  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">规则匹配</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">为你找到这些拼车</h1>
        <p className="mt-2 text-sm text-slate-500">按学校、路线、时间和行李需求综合匹配。没有足够结果时，只有你可以决定扩大范围。</p>
      </div>
      <TripSearchForm defaults={{ origin, destination, date, time }} />
      <MatchingResults matches={matches} now={now} scope={scope} baseParams={{ origin, destination, date, time }} />
    </div>
  );
}
