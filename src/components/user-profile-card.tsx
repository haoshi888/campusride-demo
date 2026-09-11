import type { School, User } from "@prisma/client";
import { CalendarCheck, CheckCircle2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/badges";
import { initials } from "@/lib/utils";

export function UserProfileCard({ user, compact = false }: { user: User & { school: School }; compact?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-brand-700 to-brand-500 p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-3xl border border-white/20 bg-white/15 text-2xl font-black backdrop-blur">{initials(user.name)}</div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black">{user.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <VerifiedBadge verified={user.schoolVerified} label={`${user.school.name} · 已认证`} />
              <VerifiedBadge verified={user.phoneVerified} label="手机号 · 已认证" />
            </div>
          </div>
        </div>
      </div>
      <div className={`grid ${compact ? "grid-cols-3" : "grid-cols-3"} divide-x divide-black/5 bg-white`}>
        <div className="p-4 text-center">
          <Star className="mx-auto size-4 fill-amber-400 text-amber-400" />
          <p className="mt-2 text-lg font-black text-ink">{user.rating.toFixed(1)}</p>
          <p className="text-[11px] text-slate-400">评分</p>
        </div>
        <div className="p-4 text-center">
          <CalendarCheck className="mx-auto size-4 text-brand-600" />
          <p className="mt-2 text-lg font-black text-ink">{user.tripCount}</p>
          <p className="text-[11px] text-slate-400">拼车次数</p>
        </div>
        <div className="p-4 text-center">
          <CheckCircle2 className="mx-auto size-4 text-brand-600" />
          <p className="mt-2 text-lg font-black text-ink">{user.punctualityRate}%</p>
          <p className="text-[11px] text-slate-400">准时率</p>
        </div>
      </div>
    </Card>
  );
}
