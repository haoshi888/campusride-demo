import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { listNotifications, markNotificationsRead } from "@/services/notificationService";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ ok: true, notifications: [] });
    return NextResponse.json({ ok: true, notifications: await listNotifications(user.id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const { action } = await readJson<{ action?: string }>(request);
    if (action === "read-all") await markNotificationsRead(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
