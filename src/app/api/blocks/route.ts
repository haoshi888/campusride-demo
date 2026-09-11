import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { blockUser, unblockUser } from "@/services/blockService";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const { userId, action } = await readJson<{ userId?: string; action?: string }>(request);
    if (!userId) throw new Error("缺少用户信息");
    const block = action === "unblock" ? await unblockUser(user.id, userId) : await blockUser(user.id, userId);
    return NextResponse.json({ ok: true, block });
  } catch (error) {
    return apiError(error);
  }
}
