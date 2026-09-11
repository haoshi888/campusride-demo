import { NextResponse } from "next/server";
import { DEMO_TIME_COOKIE } from "@/lib/constants";
import { getDemoOffsetMinutes, getDemoNowFromOffset } from "@/lib/demo-time";
import { refreshTripStatuses } from "@/services/tripService";
import { apiError, readJson } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ offsetMinutes?: number; reset?: boolean }>(request);
    const response = NextResponse.json({ ok: true });
    const current = await getDemoOffsetMinutes();
    const next = body.reset ? 0 : current + Math.max(-1440, Math.min(1440, Number(body.offsetMinutes ?? 0)));
    response.cookies.set(DEMO_TIME_COOKIE, String(next), { sameSite: "lax", maxAge: 60 * 60 * 24, path: "/" });
    await refreshTripStatuses(getDemoNowFromOffset(next));
    return response;
  } catch (error) {
    return apiError(error);
  }
}

