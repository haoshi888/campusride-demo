import { BadgeCheck, Luggage, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TRIP_STATUS_LABELS, type TripStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const statusStyles: Record<TripStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PUBLISHED: "bg-blue-50 text-blue-700",
  FORMING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-brand-100 text-brand-800",
  FULL: "bg-violet-50 text-violet-700",
  DEPARTURE_PENDING: "bg-orange-50 text-orange-700",
  TRAVELING: "bg-cyan-50 text-cyan-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  SOLO_MODE: "bg-rose-50 text-rose-700",
  CANCELLED: "bg-red-50 text-red-700",
  EXPIRED: "bg-zinc-100 text-zinc-600",
};

export function TripStatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status as TripStatus;
  return <Badge className={cn(statusStyles[key] ?? statusStyles.PUBLISHED, className)}>{TRIP_STATUS_LABELS[key] ?? status}</Badge>;
}

export function VerifiedBadge({ verified = true, label = "已认证" }: { verified?: boolean; label?: string }) {
  return (
    <Badge className={verified ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"}>
      <BadgeCheck className="size-3.5" />
      {verified ? label : "未认证"}
    </Badge>
  );
}

export function MatchScoreBadge({ score, label }: { score: number; label: string }) {
  const strong = score >= 82;
  return (
    <Badge className={strong ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}>
      <Sparkles className="size-3.5" />
      {score}% {label}
    </Badge>
  );
}

export function LuggageBadge({ count, oversized = false }: { count: number; oversized?: boolean }) {
  return (
    <Badge className="bg-slate-100 text-slate-700">
      <Luggage className="size-3.5" />
      {count}件行李{oversized ? " · 含超大件" : ""}
    </Badge>
  );
}

export function RatingBadge({ rating, punctualityRate }: { rating: number; punctualityRate?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      <span className="inline-flex items-center gap-1 text-amber-600"><Star className="size-4 fill-current" />{rating.toFixed(1)}</span>
      {typeof punctualityRate === "number" && <span className="text-slate-400">·</span>}
      {typeof punctualityRate === "number" && <span>{punctualityRate}% 准时</span>}
    </div>
  );
}
