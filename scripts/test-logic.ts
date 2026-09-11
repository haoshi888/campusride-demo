import { calculateMatchScore } from "../src/lib/matching.ts";
import { resolveTripStatus } from "../src/lib/status.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const trip = {
  id: "trip_test",
  creatorId: "u1",
  schoolId: "school_xx",
  origin: "浦东国际机场",
  destination: "XX大学",
  departureDate: new Date("2026-09-20T00:00:00+08:00"),
  departureTime: "18:00",
  departureAt: new Date("2026-09-20T18:00:00+08:00"),
  timeFlexibilityMinutes: 15,
  currentMembers: 1,
  minMembers: 2,
  maxMembers: 3,
  luggageCount: 1,
  luggageSizes: "[]",
  hasOversizedLuggage: false,
  matchingScope: "SCHOOL",
  deadlineMinutesBeforeDeparture: 60,
  status: "FORMING",
  estimatedTotalFareMin: 90,
  estimatedTotalFareMax: 130,
  hiddenByAdmin: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const user = { schoolId: "school_xx", school: { city: "上海" } };
const score = calculateMatchScore(user, { ...trip, school: { city: "上海" } }, {
  origin: "浦东国际机场",
  destination: "XX大学",
  departureAt: new Date("2026-09-20T18:10:00+08:00"),
  scope: "SCHOOL",
});
assert(score.level === 1, "same school/route/time should be level 1");
assert(score.score >= 90, "high match should score above 90");

const now = new Date("2026-09-20T17:05:00+08:00");
assert(resolveTripStatus(trip, now) === "SOLO_MODE", "deadline without min members should become SOLO_MODE");
assert(resolveTripStatus({ ...trip, currentMembers: 2 }, now) === "CONFIRMED", "two members should be confirmed");
assert(resolveTripStatus({ ...trip, currentMembers: 3 }, now) === "FULL", "max members should be full");

console.log("Logic tests passed:", { score: score.score, level: score.level, status: "ok" });

