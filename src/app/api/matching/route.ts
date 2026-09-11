import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { findMatchingTrips } from "@/services/matchingService";
import type { MatchingScope } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const { searchTrips } = await import("@/services/tripService");
      const body = await readJson<{ origin?: string; destination?: string; date?: string; time?: string }>(request);
      const trips = await searchTrips(body);
      return NextResponse.json({ ok: true, trips: trips.map((trip) => ({ trip })), guest: true });
    }
    const body = await readJson<{
      origin?: string;
      destination?: string;
      date?: string;
      time?: string;
      flexibilityMinutes?: number;
      scope?: MatchingScope;
      luggageCount?: number;
    }>(request);
    const matches = await findMatchingTrips(user, body);
    return NextResponse.json({ ok: true, matches });
  } catch (error) {
    return apiError(error);
  }
}
