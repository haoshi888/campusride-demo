import { prisma } from "@/lib/prisma";

export async function submitReview(input: { tripId: string; reviewerId: string; revieweeId: string; rating: number; tags: string[]; comment?: string }) {
  if (input.reviewerId === input.revieweeId) throw new Error("不能评价自己");
  const trip = await prisma.trip.findUnique({ where: { id: input.tripId } });
  if (!trip || trip.status !== "COMPLETED") throw new Error("行程完成后才能评价");

  const review = await prisma.review.upsert({
    where: { tripId_reviewerId_revieweeId: { tripId: input.tripId, reviewerId: input.reviewerId, revieweeId: input.revieweeId } },
    update: { rating: input.rating, tags: JSON.stringify(input.tags), comment: input.comment },
    create: {
      tripId: input.tripId,
      reviewerId: input.reviewerId,
      revieweeId: input.revieweeId,
      rating: input.rating,
      tags: JSON.stringify(input.tags),
      comment: input.comment,
    },
  });

  const stats = await prisma.review.aggregate({
    where: { revieweeId: input.revieweeId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.user.update({
    where: { id: input.revieweeId },
    data: {
      rating: stats._avg.rating ?? 5,
      ...(input.tags.includes("迟到") ? { punctualityRate: { decrement: 1 } } : {}),
    },
  });
  return review;
}
