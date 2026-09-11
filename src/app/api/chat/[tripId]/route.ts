import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { listMessages, sendMessage } from "@/services/chatService";
import { prisma } from "@/lib/prisma";

async function assertTrip(tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new Error("行程不存在");
}

export async function GET(_: Request, context: { params: Promise<{ tripId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const { tripId } = await context.params;
    await assertTrip(tripId);
    return NextResponse.json({ ok: true, messages: await listMessages(tripId) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ tripId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const { tripId } = await context.params;
    await assertTrip(tripId);
    const { content } = await readJson<{ content?: string }>(request);
    const message = await sendMessage(tripId, user.id, content ?? "");
    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return apiError(error);
  }
}

