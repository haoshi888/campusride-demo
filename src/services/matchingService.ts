import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDemoNow } from "@/lib/demo-time";
import { calculateMatchScore, isSameCalendarDay } from "@/lib/matching";
import { refreshTripStatuses } from "@/services/tripService";
import type { MatchingScope } from "@/lib/constants";
import { canJoinStatus } from "@/lib/status";

type CurrentUser = User & { school: { id: string; name: string; city: string } };

export type MatchSearchInput = {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  flexibilityMinutes?: number;
  scope?: MatchingScope;
  luggageCount?: number;
};

function scopeAllows(scope: MatchingScope, user: CurrentUser, trip: { schoolId: string; school: { city: string }; matchingScope: string }) {
  const tripScope = trip.matchingScope as MatchingScope;
  const sameSchool = trip.schoolId === user.schoolId;
  const sameCity = trip.school.city === user.school.city;

  if (scope === "SCHOOL") return sameSchool;
  if (scope === "CITY") {
    if (!sameCity) return false;
    return tripScope === "CITY" || tripScope === "ALL" || sameSchool;
  }
  if (sameSchool || (sameCity && (tripScope === "CITY" || tripScope === "ALL"))) return true;
  return tripScope === "ALL";
}

export async function findMatchingTrips(user: CurrentUser, input: MatchSearchInput) {
  await refreshTripStatuses();
  const now = await getDemoNow();
  const requestedDate = input.date ? new Date(`${input.date}T00:00:00+08:00`) : now;
  const requestedTime = input.time ?? "17:00";
  const requestedAt = new Date(`${input.date ?? requestedDate.toISOString().slice(0, 10)}T${requestedTime}:00+08:00`);
  const scope = input.scope ?? "SCHOOL";

  const [memberships, blocks, trips] = await Promise.all([
    prisma.tripMember.findMany({ where: { userId: user.id, memberStatus: "ACTIVE" }, select: { tripId: true } }),
    prisma.block.findMany({ where: { OR: [{ blockerId: user.id }, { blockedId: user.id }] } }),
    prisma.trip.findMany({
      where: { hiddenByAdmin: false },
      include: { creator: true, school: true },
    }),
  ]);
  const joinedIds = new Set(memberships.map((item) => item.tripId));
  const blockedIds = new Set(blocks.flatMap((item) => [item.blockerId, item.blockedId]).filter((id) => id !== user.id));

  return trips
    .filter((trip) => {
      if (joinedIds.has(trip.id) || blockedIds.has(trip.creatorId)) return false;
      if (!canJoinStatus(trip.status as never)) return false;
      if (!isSameCalendarDay(trip.departureAt, requestedDate)) return false;
      if (trip.currentMembers >= trip.maxMembers) return false;
      if (!scopeAllows(scope, user, trip)) return false;
      const diff = Math.abs(trip.departureAt.getTime() - requestedAt.getTime()) / 60_000;
      return diff <= 120 + (input.flexibilityMinutes ?? 0);
    })
    .map((trip) => {
      const result = calculateMatchScore(user, trip, {
        origin: input.origin,
        destination: input.destination,
        departureAt: requestedAt,
        scope,
        luggageCount: input.luggageCount,
      });
      return { trip, ...result };
    })
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      if (b.score !== a.score) return b.score - a.score;
      return a.timeDiffMinutes - b.timeDiffMinutes;
    });
}

export async function getMatchingPreview(user: CurrentUser, input: MatchSearchInput) {
  const result = await findMatchingTrips(user, input);
  return result.slice(0, 8);
}
