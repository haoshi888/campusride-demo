import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { reportSchema } from "@/lib/validation";
import { submitReport } from "@/services/reportService";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const parsed = reportSchema.parse(await readJson(request));
    return NextResponse.json({ ok: true, report: await submitReport({ reporterId: user.id, ...parsed }) });
  } catch (error) {
    return apiError(error);
  }
}
