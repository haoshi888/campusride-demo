import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Users } from "lucide-react";
import type { Trip, School, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LuggageBadge, MatchScoreBadge, RatingBadge, TripStatusBadge, VerifiedBadge } from "@/components/badges";
import { formatTime, relativeDepartureLabel } from "@/lib/utils";
import type { MatchResult } from "@/lib/matching";

type TripCardTrip = Trip & {
  school: School;
  creator: User & { school?: School | null };
  members?: { userId: string }[];
};

export function TripCard({
  trip,
  now,
  match,
  compact = false,
}: {
  trip: TripCardTrip;
  now: Date;
  match?: MatchResult;
  compact?: boolean;
}) {
  return (
    <Card className="group overflow-hidden transition hover:-translate-y-0.5 hover:border-brand-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">{trip.school.name}</span>
              <VerifiedBadge verified={trip.creator.schoolVerified} />
            </div>
            <p className="mt-1 text-xs text-slate-500">发起人 {trip.creator.name}</p>
          </div>
          <TripStatusBadge status={trip.status} />
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-3">
            <MapPin className="size-4 shrink-0 text-brand-600" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-base font-bold text-ink">
                <span className="truncate">{trip.origin}</span>
                <ArrowRight className="size-4 shrink-0 text-slate-300" />
                <span className="truncate">{trip.destination}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock3 className="size-4 text-slate-400" />
            {relativeDepartureLabel(trip.departureAt, now)}
            <span className="font-normal text-slate-400">· {formatTime(trip.departureAt)}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 font-semibold text-slate-700">
            <Users className="size-4 text-brand-600" />
            {trip.currentMembers} / {trip.maxMembers} 人
          </div>
          <LuggageBadge count={trip.luggageCount} oversized={trip.hasOversizedLuggage} />
        </div>

        {!compact && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
            <RatingBadge rating={trip.creator.rating} punctualityRate={trip.creator.punctualityRate} />
            {match && (
              <div className="flex flex-wrap items-center gap-2">
                <MatchScoreBadge score={match.score} label={match.label} />
                {match.reasons.slice(0, 2).map((reason) => (
                  <span key={reason} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">{reason}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Link href={`/trips/${trip.id}`} className="block border-t border-black/5 bg-white p-3">
        <Button variant="ghost" className="w-full justify-between px-4 text-brand-700 hover:bg-brand-50">
          查看详情 <ArrowRight className="size-4" />
        </Button>
      </Link>
    </Card>
  );
}
