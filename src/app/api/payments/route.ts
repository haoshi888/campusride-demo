import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { confirmPaymentCommitment, getPaymentCommitment } from "@/services/paymentService";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const tripId = new URL(request.url).searchParams.get("tripId") ?? "";
    return NextResponse.json({ ok: true, commitment: await getPaymentCommitment(tripId, user.id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const { tripId } = await readJson<{ tripId?: string }>(request);
    if (!tripId) throw new Error("缺少行程信息");
    return NextResponse.json({ ok: true, commitment: await confirmPaymentCommitment(tripId, user.id) });
  } catch (error) {
    return apiError(error);
  }
}
