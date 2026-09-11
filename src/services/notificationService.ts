import { prisma } from "@/lib/prisma";

type NotificationInput = {
  userId: string;
  tripId?: string | null;
  type: string;
  title: string;
  content: string;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function notifyTripMembers(tripId: string, input: Omit<NotificationInput, "userId" | "tripId">) {
  const members = await prisma.tripMember.findMany({
    where: { tripId, memberStatus: "ACTIVE" },
    select: { userId: true },
  });
  if (!members.length) return [];
  return prisma.notification.createMany({
    data: members.map((member) => ({ ...input, tripId, userId: member.userId })),
  });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markNotificationsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}
