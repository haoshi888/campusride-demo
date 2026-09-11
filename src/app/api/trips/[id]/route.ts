import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { getTripById, updateTrip } from "@/services/tripService";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const trip = await getTripById(id);
    if (!trip) return NextResponse.json({ ok: false, error: "行程不存在" }, { status: 404 });
    return NextResponse.json({ ok: true, trip });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const { id } = await context.params;
    const trip = await updateTrip(id, user.id, await readJson(request));
    return NextResponse.json({ ok: true, trip });
  } catch (error) {
    return apiError(error);
  }
}
