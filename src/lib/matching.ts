import type { Trip, User } from "@prisma/client";
import type { MatchingScope } from "@/lib/constants";

export type MatchBreakdown = {
  schoolScore: number;
  routeScore: number;
  timeScore: number;
  luggageScore: number;
  capacityScore: number;
};

export type MatchResult = {
  score: number;
  level: number;
  label: "高匹配" | "中匹配" | "跨校匹配" | "可考虑";
  breakdown: MatchBreakdown;
  reasons: string[];
  timeDiffMinutes: number;
};

type MatchUser = Pick<User, "schoolId"> & { school?: { city: string } | null };
type MatchTrip = Pick<
  Trip,
  | "schoolId"
  | "origin"
  | "destination"
  | "departureAt"
  | "currentMembers"
  | "maxMembers"
  | "luggageCount"
  | "hasOversizedLuggage"
> & { school?: { city: string } | null; requesterLuggageCount?: number };

function normalizePlace(value: string) {
  return value
    .replace(/国际|国内|机场|火车站|高铁站|校区|大学/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function routeScore(userOrigin: string, userDestination: string, trip: MatchTrip) {
  const o = normalizePlace(userOrigin) === normalizePlace(trip.origin);
  const d = normalizePlace(userDestination) === normalizePlace(trip.destination);
  if (o && d) return { score: 30, reason: "路线一致" };
  if (d || normalizePlace(userDestination).includes(normalizePlace(trip.destination))) {
    return { score: 23, reason: "目的地接近" };
  }
  if (o || normalizePlace(userOrigin).includes(normalizePlace(trip.origin))) {
    return { score: 19, reason: "出发地接近" };
  }
  return { score: 7, reason: "路线可扩展" };
}

export function calculateMatchScore(
  user: MatchUser,
  trip: MatchTrip,
  query?: { origin?: string; destination?: string; departureAt?: Date; scope?: MatchingScope; luggageCount?: number },
): MatchResult {
  let schoolScore = 12;
  let level = 5;
  const reasons: string[] = [];

  if (trip.schoolId === user.schoolId) {
    schoolScore = 45;
    level = 1;
    reasons.push("同校");
  } else if (trip.school?.city && user.school?.city && trip.school.city === user.school.city) {
    schoolScore = 29;
    level = 4;
    reasons.push("同城高校");
  } else {
    schoolScore = 12;
    level = 5;
    reasons.push("跨校行程");
  }

  const userOrigin = query?.origin || trip.origin;
  const userDestination = query?.destination || trip.destination;
  const route = routeScore(userOrigin, userDestination, trip);

  if (level !== 4 && level !== 5) {
    if (normalizePlace(userOrigin) !== normalizePlace(trip.origin) && normalizePlace(userDestination) === normalizePlace(trip.destination)) level = 3;
    if (normalizePlace(userOrigin) === normalizePlace(trip.origin) && normalizePlace(userDestination) !== normalizePlace(trip.destination)) level = 2;
    if (normalizePlace(userOrigin) === normalizePlace(trip.origin) && normalizePlace(userDestination) === normalizePlace(trip.destination)) level = 1;
  }
  reasons.push(route.reason);

  const targetTime = query?.departureAt ? new Date(query.departureAt) : new Date(trip.departureAt);
  const timeDiffMinutes = Math.round(Math.abs(targetTime.getTime() - new Date(trip.departureAt).getTime()) / 60_000);
  let timeScore = 5;
  if (timeDiffMinutes <= 15) timeScore = 20;
  else if (timeDiffMinutes <= 30) timeScore = 17;
  else if (timeDiffMinutes <= 60) timeScore = 14;
  else if (timeDiffMinutes <= 120) timeScore = 10;
  if (timeDiffMinutes <= 30) reasons.push("时间接近");

  const requesterLuggage = query?.luggageCount ?? trip.requesterLuggageCount ?? 0;
  const luggageTotal = trip.luggageCount + requesterLuggage;
  const capacityScore = trip.currentMembers < trip.maxMembers ? 5 : 0;
  const luggageScore = trip.hasOversizedLuggage || luggageTotal > trip.maxMembers + 2 ? 2 : 5;
  if (!trip.hasOversizedLuggage && luggageTotal <= trip.maxMembers + 1) reasons.push("行李匹配");

  const breakdown = { schoolScore, routeScore: route.score, timeScore, luggageScore, capacityScore };
  const score = Math.min(99, Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0)));

  return {
    score,
    level,
    label: score >= 82 ? "高匹配" : score >= 68 ? "中匹配" : level >= 4 ? "跨校匹配" : "可考虑",
    breakdown,
    reasons: Array.from(new Set(reasons)),
    timeDiffMinutes,
  };
}

export function isSameCalendarDay(first: Date, second: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" });
  return formatter.format(first) === formatter.format(second);
}
