import { prisma } from "@/lib/prisma";

export async function getPaymentCommitment(tripId: string, userId: string) {
  return prisma.paymentCommitment.findUnique({ where: { tripId_userId: { tripId, userId } } });
}

export async function confirmPaymentCommitment(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new Error("行程不存在");
  const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  if (!member || member.memberStatus !== "ACTIVE") throw new Error("请先加入拼车");

  const reference = await prisma.paymentCommitment.findFirst({
    where: { tripId, status: "CONFIRMED", userId: { not: userId } },
    select: { amount: true },
  });
  const amount = reference?.amount ?? Math.round(((trip.estimatedTotalFareMin ?? 80) + (trip.estimatedTotalFareMax ?? 110)) / 2 / Math.max(2, trip.maxMembers));
  const commitment = await prisma.paymentCommitment.upsert({
    where: { tripId_userId: { tripId, userId } },
    update: { status: "CONFIRMED", amount },
    create: { tripId, userId, amount, status: "CONFIRMED" },
  });
  await prisma.tripMember.update({
    where: { tripId_userId: { tripId, userId } },
    data: { paymentStatus: "CONFIRMED" },
  });
  return commitment;
}
