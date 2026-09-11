import type { Trip } from "@prisma/client";
import type { TripStatus } from "@/lib/constants";

type ResolvableTrip = Pick<
  Trip,
  | "status"
  | "currentMembers"
  | "minMembers"
  | "maxMembers"
  | "departureAt"
  | "deadlineMinutesBeforeDeparture"
>;

const LOCKED_STATUSES = new Set<TripStatus>(["CANCELLED", "COMPLETED", "SOLO_MODE", "EXPIRED"]);

export function resolveTripStatus(trip: ResolvableTrip, now: Date): TripStatus {
  const current = trip.status as TripStatus;

  if (LOCKED_STATUSES.has(current)) return current;
  if (current === "DRAFT") return "DRAFT";

  const departure = new Date(trip.departureAt);
  const deadline = new Date(departure.getTime() - trip.deadlineMinutesBeforeDeparture * 60_000);
  const expiredAt = new Date(departure.getTime() + 120 * 60_000);

  if (now >= expiredAt) return "EXPIRED";
  if (current === "TRAVELING") return "TRAVELING";

  if (now >= deadline && trip.currentMembers < trip.minMembers) {
    return "SOLO_MODE";
  }

  if (trip.currentMembers >= trip.maxMembers) return "FULL";
  if (trip.currentMembers >= trip.minMembers) {
    const departingSoon = departure.getTime() - now.getTime() <= 5 * 60_000;
    return departingSoon || current === "DEPARTURE_PENDING" ? "DEPARTURE_PENDING" : "CONFIRMED";
  }

  if (now >= departure) return "DEPARTURE_PENDING";
  return trip.currentMembers > 1 ? "FORMING" : "PUBLISHED";
}

export function canJoinStatus(status: TripStatus) {
  return status === "PUBLISHED" || status === "FORMING";
}
