import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { cancelTrip, completeTrip, joinTrip, leaveTrip, startTraveling } from "@/services/tripService";
import { joinTripSchema } from "@/lib/validation";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const { id } = await context.params;
    const body = await readJson<{ action: string; luggageCount?: number; luggageSizes?: string[] }>(request);

    if (body.action === "join") {
      const parsed = joinTripSchema.parse(body);
      const trip = await joinTrip(id, user.id, parsed);
      return NextResponse.json({ ok: true, trip });
    }
    if (body.action === "leave") return NextResponse.json({ ok: true, trip: await leaveTrip(id, user.id) });
    if (body.action === "cancel") return NextResponse.json({ ok: true, trip: await cancelTrip(id, user.id) });
    if (body.action === "start-traveling") return NextResponse.json({ ok: true, trip: await startTraveling(id, user.id) });
    if (body.action === "complete") return NextResponse.json({ ok: true, trip: await completeTrip(id, user.id) });
    throw new Error("不支持的行程操作");
  } catch (error) {
    return apiError(error);
  }
}
