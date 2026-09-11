import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { createTrip, searchTrips } from "@/services/tripService";
import { createTripSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const trips = await searchTrips({
      origin: url.searchParams.get("origin") ?? undefined,
      destination: url.searchParams.get("destination") ?? undefined,
      date: url.searchParams.get("date") ?? undefined,
      time: url.searchParams.get("time") ?? undefined,
      school: url.searchParams.get("school") ?? undefined,
      limit: Number(url.searchParams.get("limit") ?? 30),
    });
    return NextResponse.json({ ok: true, trips });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const parsed = createTripSchema.parse(await readJson(request));
    const trip = await createTrip(user.id, parsed);
    return NextResponse.json({ ok: true, trip });
  } catch (error) {
    return apiError(error);
  }
}
