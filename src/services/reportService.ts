import { prisma } from "@/lib/prisma";

export async function submitReport(input: { reporterId: string; reportedUserId?: string; tripId?: string; type: string; description: string }) {
  const report = await prisma.report.create({ data: input });
  if (input.reportedUserId) {
    await prisma.notification.create({
      data: {
        userId: input.reportedUserId,
        tripId: input.tripId,
        type: "REPORT_RECEIVED",
        title: "收到一条安全反馈",
        content: "管理员会尽快核实相关情况。",
      },
    });
  }
  return report;
}

export async function listReports() {
  return prisma.report.findMany({
    include: {
      reporter: { select: { id: true, name: true } },
      reportedUser: { select: { id: true, name: true } },
      trip: { select: { id: true, origin: true, destination: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateReportStatus(id: string, status: "PENDING" | "RESOLVED" | "REJECTED", adminNote?: string) {
  return prisma.report.update({ where: { id }, data: { status, adminNote } });
}
