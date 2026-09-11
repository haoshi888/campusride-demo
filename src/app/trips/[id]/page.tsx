import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, CreditCard, Luggage, MapPin, MessageCircle, ShieldCheck, Star, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDemoNow } from "@/lib/demo-time";
import { getPaymentCommitment } from "@/services/paymentService";
import { getSimilarTrips, getTripById } from "@/services/tripService";
import { TripStatusBadge, VerifiedBadge } from "@/components/badges";
import { TripActions } from "@/components/trip-actions";
import { SafetyActions } from "@/components/safety-actions";
import { TripCard } from "@/components/trip-card";
import { Card } from "@/components/ui/card";
import { formatDateTime, parseJsonArray } from "@/lib/utils";
import type { TripStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [trip, user, now] = await Promise.all([getTripById(id), getCurrentUser(), getDemoNow()]);
  if (!trip) notFound();
  const membership = user ? trip.members.find((member) => member.userId === user.id) : null;
  const isCreator = user?.id === trip.creatorId;
  const isMember = Boolean(membership);
  const payment = user && isMember ? await getPaymentCommitment(trip.id, user.id) : null;
  const similar = ["CANCELLED", "FULL", "SOLO_MODE"].includes(trip.status) ? await getSimilarTrips(trip.id) : [];
  const luggageSizes = parseJsonArray(trip.luggageSizes);
  const fare = Math.round(((trip.estimatedTotalFareMin ?? 90) + (trip.estimatedTotalFareMax ?? 130)) / 2 / Math.max(2, trip.maxMembers));
  const status = trip.status as TripStatus;

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <TripStatusBadge status={trip.status} />
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{trip.matchingScope === "SCHOOL" ? "同校优先" : trip.matchingScope === "CITY" ? "同城高校" : "所有高校"}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{trip.origin} → {trip.destination}</h1>
        <p className="mt-2 text-sm text-slate-500">规则匹配行程 · 创建于 {formatDateTime(trip.createdAt)}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
              <div className="p-6">
                <div className="relative pl-8">
                  <span className="absolute left-0 top-1.5 grid size-5 place-items-center rounded-full bg-brand-100 text-brand-700"><MapPin className="size-3" /></span>
                  <span className="absolute bottom-2 left-2 top-8 w-px border-l border-dashed border-slate-300" />
                  <span className="absolute bottom-1 left-0 grid size-5 place-items-center rounded-full bg-orange-100 text-orange-700"><MapPin className="size-3" /></span>
                  <p className="text-xl font-black text-ink">{trip.origin}</p>
                  <p className="mb-8 mt-1 text-xs text-slate-400">出发地</p>
                  <p className="text-xl font-black text-ink">{trip.destination}</p>
                  <p className="mt-1 text-xs text-slate-400">目的地</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="size-4 text-brand-600" /><p className="mt-2 font-bold text-ink">{formatDateTime(trip.departureAt)}</p><p className="mt-1 text-xs text-slate-500">±{trip.timeFlexibilityMinutes} 分钟弹性</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><Users className="size-4 text-brand-600" /><p className="mt-2 font-bold text-ink">{trip.currentMembers} / {trip.maxMembers} 人</p><p className="mt-1 text-xs text-slate-500">{trip.currentMembers >= trip.minMembers ? "已达到最低成团人数" : `再来 ${trip.minMembers - trip.currentMembers} 人即可成团`}</p></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-black text-ink">同行成员</h2>
            <div className="mt-4 space-y-3">
              {trip.members.length ? trip.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4 rounded-3xl border border-black/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand-100 font-black text-brand-800">{member.user.name.slice(0, 1)}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2"><p className="font-bold text-ink">{member.user.name}</p>{member.role === "CREATOR" && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">发起人</span>}</div>
                      <p className="mt-1 text-xs text-slate-500">{member.user.school.name} · ⭐ {member.user.rating.toFixed(1)} · 准时率 {member.user.punctualityRate}%</p>
                    </div>
                  </div>
                  {member.userId !== user?.id && <SafetyActions tripId={trip.id} targetUserId={member.userId} targetName={member.user.name} />}
                </div>
              )) : <p className="text-sm text-slate-500">暂时没有其他成员。</p>}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3"><Luggage className="size-5 text-brand-600" /><div><h2 className="font-black text-ink">行李信息</h2><p className="text-xs text-slate-500">发起人结构化填写，仅供同行判断</p></div></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{trip.luggageCount} 件行李</span>
              {luggageSizes.map((size, index) => <span key={`${size}-${index}`} className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">{size}</span>)}
              {trip.hasOversizedLuggage && <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">含超大件</span>}
            </div>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {status === "SOLO_MODE" && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
              <p className="font-black text-rose-900">已进入单独出行模式</p>
              <p className="mt-1 text-sm leading-6 text-rose-700">当前未达到最低成团人数。请自行叫车，不耽误正常出行。</p>
            </div>
          )}
          <Card className="p-5">
            <div className="flex items-center gap-3"><CreditCard className="size-5 text-brand-600" /><div><p className="font-bold text-ink">预计人均</p><p className="text-xs text-slate-400">非真实网约车报价</p></div></div>
            <p className="mt-4 text-4xl font-black text-ink">¥{fare}<span className="text-sm font-semibold text-slate-400"> / 人</span></p>
            <p className="mt-2 text-xs text-slate-500">预计总车费 ¥{trip.estimatedTotalFareMin ?? 90}～{trip.estimatedTotalFareMax ?? 130}，实际费用以最终打车订单为准。</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-100 font-black text-brand-800">{trip.creator.name.slice(0, 1)}</span>
              <div><p className="font-bold text-ink">{trip.creator.name}</p><div className="mt-1"><VerifiedBadge verified={trip.creator.schoolVerified} label={`${trip.school.name} · 已认证`} /></div></div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-amber-600"><Star className="size-4 fill-current" />{trip.creator.rating.toFixed(1)}</span>
              <span className="text-slate-500">拼车 {trip.creator.tripCount} 次</span>
              <span className="text-slate-500">准时率 {trip.creator.punctualityRate}%</span>
            </div>
            {user && user.id !== trip.creatorId && <div className="mt-3 border-t border-black/5 pt-3"><Link href={`/chat/${trip.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700"><MessageCircle className="size-4" />匹配前联系发起人</Link></div>}
          </Card>
          <Card className="p-5">
            <TripActions
              tripId={trip.id}
              status={status}
              currentUserId={user?.id}
              isCreator={Boolean(isCreator)}
              isMember={isMember}
              paymentStatus={payment?.status}
              isVerified={Boolean(user?.phoneVerified && user.schoolVerified && user.emailVerified)}
              fare={fare}
              maxMembers={trip.maxMembers}
            />
          </Card>
          <div className="flex items-start gap-2 rounded-2xl bg-white/60 p-3 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />本 Demo 不调用真实定位、地图或网约车 API。</div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-black">相似行程</h2>
          <div className="grid gap-4 md:grid-cols-3">{similar.map((item) => <TripCard key={item.id} trip={item} now={now} compact />)}</div>
        </section>
      )}
    </div>
  );
}
