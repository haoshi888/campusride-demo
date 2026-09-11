import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { listReports, updateReportStatus } from "@/services/reportService";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) throw new Error("没有管理员权限");
    const [userCount, verifiedCount, activeTrips, completedMembers, pendingReports, users, trips, reports] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { schoolVerified: true, phoneVerified: true } }),
      prisma.trip.count({ where: { status: { in: ["PUBLISHED", "FORMING", "CONFIRMED", "FULL", "DEPARTURE_PENDING", "TRAVELING"] } } }),
      prisma.tripMember.count({ where: { memberStatus: "ACTIVE", trip: { status: "COMPLETED" } } }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({ include: { school: true }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.trip.findMany({ include: { creator: true, school: true }, orderBy: { createdAt: "desc" }, take: 50 }),
      listReports(),
    ]);
    return NextResponse.json({ ok: true, stats: { userCount, verifiedCount, activeTrips, completedMembers, pendingReports }, users, trips, reports });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.isAdmin) throw new Error("没有管理员权限");
    const body = await readJson<{ action: string; userId?: string; disabled?: boolean; tripId?: string; reportId?: string; status?: "PENDING" | "RESOLVED" | "REJECTED"; adminNote?: string }>(request);
    if (body.action === "toggle-user" && body.userId) {
      await prisma.user.update({ where: { id: body.userId }, data: { isDisabled: Boolean(body.disabled) } });
    } else if (body.action === "hide-trip" && body.tripId) {
      await prisma.trip.update({ where: { id: body.tripId }, data: { hiddenByAdmin: true, status: "CANCELLED" } });
    } else if (body.action === "report-status" && body.reportId && body.status) {
      await updateReportStatus(body.reportId, body.status, body.adminNote);
    } else {
      throw new Error("不支持的管理操作");
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
