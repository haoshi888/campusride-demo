import Link from "next/link";
import { ArrowRight, BadgeCheck, Luggage, ShieldCheck, Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { refreshTripStatuses } from "@/services/tripService";
import { TripCard } from "@/components/trip-card";
import { TripSearchForm } from "@/components/trip-search-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = await refreshTripStatuses();
  const upcoming = await prisma.trip.findMany({
    where: {
      hiddenByAdmin: false,
      status: { in: ["PUBLISHED", "FORMING", "CONFIRMED", "FULL", "DEPARTURE_PENDING"] },
      currentMembers: { lt: prisma.trip.fields.maxMembers },
    },
    include: { creator: true, school: true, members: { where: { memberStatus: "ACTIVE" } } },
    orderBy: { departureAt: "asc" },
    take: 6,
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-4xl bg-ink px-5 py-8 text-white shadow-float sm:px-8 sm:py-12 lg:px-12">
        <div className="absolute -right-16 -top-20 size-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-coral-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-100 backdrop-blur">
            <Sparkles className="size-3.5" /> 规则匹配 · 不做黑盒推荐
          </div>
          <h1 className="text-balance text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            返校回学校，<br className="sm:hidden" />一起打车更省钱
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            找同校同学一起拼车，省钱又安心。能拼到就一起走，拼不到也绝不耽误正常出行。
          </p>
          <div className="mt-7 max-w-4xl">
            <TripSearchForm variant="hero" />
          </div>
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2 px-1 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-brand-300" />校园身份认证</span>
            <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-brand-300" />同校优先匹配</span>
            <span className="inline-flex items-center gap-1.5"><Luggage className="size-3.5 text-brand-300" />结构化行李信息</span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">即将出发</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-ink">找到正在发生的拼车</h2>
            <p className="mt-1 text-sm text-slate-500">优先展示最近出发且尚未满员的行程。</p>
          </div>
          <Link href="/search" className="hidden items-center gap-1 text-sm font-bold text-brand-700 sm:flex">
            查看全部 <ArrowRight className="size-4" />
          </Link>
        </div>
        {upcoming.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((trip) => <TripCard key={trip.id} trip={trip} now={now} />)}
          </div>
        ) : (
          <EmptyState title="还没有即将出发的拼车，成为第一个发起人吧。" description="发布你的返程计划，让同校同路的同学找到你。" actionLabel="发布拼车" actionHref="/trips/create" />
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_.8fr]">
        <div className="surface overflow-hidden p-6 sm:p-8">
          <p className="eyebrow">核心机制</p>
          <h2 className="mt-2 text-2xl font-black text-ink">拼车失败，也有单独出行兜底</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            在出发前设置停止等待的截止时间。达到截止时间仍未满足最低成团人数时，系统自动切换为 SOLO_MODE，提醒你自行叫车，不让等待成为出行风险。
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "结构化行程", "路线、时间、人数和行李都可解释。"],
              ["02", "同校优先", "逐步扩大到同城高校和所有高校。"],
              ["03", "自动兜底", "到截止时间未成团即进入单独出行。"],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl bg-slate-50 p-4">
                <span className="text-xs font-black text-brand-600">{number}</span>
                <p className="mt-3 font-bold text-ink">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-4xl bg-brand-600 p-6 text-white shadow-card sm:p-8">
          <BadgeCheck className="size-8" />
          <h2 className="mt-5 text-2xl font-black">发布我的拼车</h2>
          <p className="mt-3 text-sm leading-6 text-white/75">填写出发地、目的地、时间、人数和行李。系统按明确规则为你找同行者。</p>
          <Link href="/trips/create" className="mt-7 block">
            <Button variant="secondary" size="lg" className="w-full bg-white text-brand-800 hover:bg-brand-50">
              发布拼车 <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
