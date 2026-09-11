import Link from "next/link";
import { ArrowRight, CarFront, Clock3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshTripStatuses } from "@/services/tripService";
import { TripCard } from "@/components/trip-card";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MyTripsPage() {
  const user = await requireUser();
  const now = await refreshTripStatuses();
  const memberships = await prisma.tripMember.findMany({
    where: { userId: user.id, memberStatus: "ACTIVE" },
    include: { trip: { include: { creator: true, school: true, members: { where: { memberStatus: "ACTIVE" } } } } },
    orderBy: { joinedAt: "desc" },
  });
  const activeStatuses = new Set(["PUBLISHED", "FORMING", "CONFIRMED", "FULL", "DEPARTURE_PENDING", "TRAVELING", "SOLO_MODE"]);
  const active = memberships.filter((item) => activeStatuses.has(item.trip.status));
  const history = memberships.filter((item) => !activeStatuses.has(item.trip.status));

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow">我的行程</p><h1 className="mt-1 text-3xl font-black tracking-tight">正在发生与已经结束</h1><p className="mt-2 text-sm text-slate-500">管理你的拼车、费用承诺、群聊和出发提醒。</p></div>
        <Link href="/trips/create" className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white"><CarFront className="size-4" />发布拼车</Link>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-black">进行中</h2>
        {active.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{active.map((item) => <TripCard key={item.id} trip={item.trip} now={now} />)}</div> : <EmptyState title="你还没有参加任何拼车。" description="从首页或搜索页找到同校同路的同学，开始你的第一条拼车行程。" actionLabel="开始寻找" actionHref="/search" />}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-black">历史行程</h2>
        {history.length ? (
          <div className="space-y-3">{history.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Clock3 className="size-5" /></span><div className="min-w-0"><p className="truncate font-bold text-ink">{item.trip.origin} → {item.trip.destination}</p><p className="mt-1 text-xs text-slate-500">{item.trip.status}</p></div></div>
              <Link href={`/trips/${item.trip.id}`} className="shrink-0 text-sm font-bold text-brand-700">查看 <ArrowRight className="inline size-4" /></Link>
            </Card>
          ))}</div>
        ) : <p className="surface p-6 text-center text-sm text-slate-500">还没有历史行程。</p>}
      </section>
    </div>
  );
}
