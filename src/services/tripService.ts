import type { Prisma, Trip } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDemoNow } from "@/lib/demo-time";
import { canJoinStatus, resolveTripStatus } from "@/lib/status";
import { createNotification, notifyTripMembers } from "@/services/notificationService";
import type { MatchingScope, TripStatus } from "@/lib/constants";

export const tripInclude = {
  creator: { include: { school: true } },
  school: true,
  members: {
    where: { memberStatus: "ACTIVE" },
    include: { user: { include: { school: true } } },
    orderBy: { joinedAt: "asc" as const },
  },
  conversation: true,
  paymentCommitments: true,
} satisfies Prisma.TripInclude;

export type TripWithRelations = Prisma.TripGetPayload<{ include: typeof tripInclude }>;
export type TripCardData = Trip & {
  schoolName: string;
  creatorName: string;
  creatorRating: number;
  creatorPunctualityRate: number;
};

export async function refreshTripStatuses(nowOverride?: Date) {
  const now = nowOverride ?? await getDemoNow();
  const trips = await prisma.trip.findMany({
    where: { status: { notIn: ["CANCELLED", "COMPLETED", "SOLO_MODE", "EXPIRED", "DRAFT"] } },
  });

  for (const trip of trips) {
    const nextStatus = resolveTripStatus(trip, now);
    if (nextStatus === trip.status) continue;
    await prisma.trip.update({ where: { id: trip.id }, data: { status: nextStatus } });

    if (nextStatus === "SOLO_MODE") {
      await notifyTripMembers(trip.id, {
        type: "SOLO_MODE",
        title: "已切换为单独出行",
        content: "当前未达到最低成团人数，已切换为单独出行模式。",
      });
    }
    if (nextStatus === "DEPARTURE_PENDING") {
      await notifyTripMembers(trip.id, {
        type: "DEPARTURE_REMINDER",
        title: "你的拼车即将出发",
        content: "请确认行程，并准备开始打车。",
      });
    }
    if (nextStatus === "EXPIRED") {
      await notifyTripMembers(trip.id, {
        type: "TRIP_EXPIRED",
        title: "行程已过期",
        content: "超过计划出发时间较久，系统已将行程标记为过期。",
      });
    }
  }
  return now;
}

export async function getTripById(id: string) {
  await refreshTripStatuses();
  return prisma.trip.findUnique({ where: { id }, include: tripInclude });
}

export async function checkTripDeadline(tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return null;
  const now = await getDemoNow();
  const status = resolveTripStatus(trip, now);
  if (status !== trip.status) {
    return prisma.trip.update({ where: { id: tripId }, data: { status } });
  }
  return trip;
}

export async function updateTripStatus(tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new Error("行程不存在");
  const now = await getDemoNow();
  const status = resolveTripStatus(trip, now);
  return prisma.trip.update({ where: { id: tripId }, data: { status } });
}

export async function createTrip(creatorId: string, input: {
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  timeFlexibilityMinutes: number;
  minMembers: number;
  maxMembers: number;
  luggageCount: number;
  luggageSizes: string[];
  hasOversizedLuggage: boolean;
  matchingScope: MatchingScope;
  deadlineMinutesBeforeDeparture: number;
}) {
  const user = await prisma.user.findUnique({ where: { id: creatorId }, include: { school: true } });
  if (!user) throw new Error("请先登录");
  if (!user.phoneVerified || !user.schoolVerified || !user.emailVerified) throw new Error("完成手机号和校园认证后才能发布行程");

  const departureAt = new Date(`${input.departureDate}T${input.departureTime}:00+08:00`);
  if (Number.isNaN(departureAt.getTime())) throw new Error("出发时间无效");
  const now = await getDemoNow();
  const latest = new Date(now.getTime() + 3 * 24 * 60 * 60_000);
  if (departureAt < now) throw new Error("出发时间不能早于当前 Demo 时间");
  if (departureAt > latest) throw new Error("Demo 仅支持发布未来 3 天内的行程");
  if (input.deadlineMinutesBeforeDeparture < 15) throw new Error("单独出行截止时间至少为出发前 15 分钟");
  if (input.deadlineMinutesBeforeDeparture >= (departureAt.getTime() - now.getTime()) / 60_000 + 1) throw new Error("截止时间必须早于出发时间");

  const normalizedDate = new Date(`${input.departureDate}T00:00:00+08:00`);
  const trip = await prisma.trip.create({
    data: {
      creatorId,
      schoolId: user.schoolId,
      origin: input.origin,
      destination: input.destination,
      departureDate: normalizedDate,
      departureTime: input.departureTime,
      departureAt,
      timeFlexibilityMinutes: input.timeFlexibilityMinutes,
      currentMembers: 1,
      minMembers: input.minMembers,
      maxMembers: input.maxMembers,
      luggageCount: input.luggageCount,
      luggageSizes: JSON.stringify(input.luggageSizes),
      hasOversizedLuggage: input.hasOversizedLuggage,
      matchingScope: input.matchingScope,
      deadlineMinutesBeforeDeparture: input.deadlineMinutesBeforeDeparture,
      status: "PUBLISHED",
      estimatedTotalFareMin: 90,
      estimatedTotalFareMax: 130,
      members: {
        create: {
          userId: creatorId,
          role: "CREATOR",
          luggageCount: input.luggageCount,
          luggageSizes: JSON.stringify(input.luggageSizes),
          paymentStatus: "PENDING",
        },
      },
      conversation: {
        create: {
          type: "TRIP_GROUP",
          participantIds: JSON.stringify([creatorId]),
        },
      },
    },
    include: tripInclude,
  });

  await createNotification({
    userId: creatorId,
    tripId: trip.id,
    type: "MATCH_FOUND",
    title: "拼车已发布",
    content: "系统正在按学校、路线和时间为你寻找同行者。",
  });
  return trip;
}

export async function joinTrip(tripId: string, userId: string, input: { luggageCount: number; luggageSizes: string[] }) {
  await refreshTripStatuses();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("请先登录");
  if (!user.phoneVerified || !user.schoolVerified || !user.emailVerified) throw new Error("完成校园认证后才能加入拼车");

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: tripInclude });
  if (!trip) throw new Error("行程不存在");
  const status = resolveTripStatus(trip, await getDemoNow());
  if (status === "FULL") throw new Error("该拼车已经满员");
  if (!canJoinStatus(status)) throw new Error("当前行程不可加入");

  const existing = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  if (existing?.memberStatus === "ACTIVE") throw new Error("你已经加入该拼车");

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId, blockedId: trip.creatorId }, { blockerId: trip.creatorId, blockedId: userId }] },
  });
  if (blocks.length) throw new Error("你与发起人之间存在拉黑关系，无法加入");

  const potentialLuggageLoad = trip.luggageCount + input.luggageCount;
  if (potentialLuggageLoad > trip.maxMembers * 2 + 2) {
    throw new Error("行李数量可能明显超载，请减少行李或联系发起人。");
  }

  const conflictWindow = 120 * 60_000;
  const memberships = await prisma.tripMember.findMany({
    where: { userId, memberStatus: "ACTIVE", tripId: { not: tripId } },
    include: { trip: true },
  });
  const conflict = memberships.find((membership) => {
    const statusValue = membership.trip.status as TripStatus;
    if (["CANCELLED", "COMPLETED", "EXPIRED"].includes(statusValue)) return false;
    const diff = Math.abs(membership.trip.departureAt.getTime() - trip.departureAt.getTime());
    return diff < conflictWindow;
  });
  if (conflict) {
    throw new Error(`该行程可能与您已有的「${conflict.trip.origin} → ${conflict.trip.destination}」发生时间冲突。`);
  }

  const nextCount = trip.currentMembers + 1;
  const nextStatus = resolveTripStatus({ ...trip, currentMembers: nextCount }, await getDemoNow());

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.tripMember.update({
        where: { tripId_userId: { tripId, userId } },
        data: {
          memberStatus: "ACTIVE",
          role: "MEMBER",
          luggageCount: input.luggageCount,
          luggageSizes: JSON.stringify(input.luggageSizes),
          paymentStatus: "PENDING",
          joinedAt: new Date(),
        },
      });
    } else {
      await tx.tripMember.create({
        data: {
          tripId,
          userId,
          role: "MEMBER",
          luggageCount: input.luggageCount,
          luggageSizes: JSON.stringify(input.luggageSizes),
        },
      });
    }
    await tx.trip.update({
      where: { id: tripId },
      data: { currentMembers: nextCount, status: nextStatus },
    });
    const participants = trip.members.map((member) => member.userId);
    await tx.conversation.upsert({
      where: { tripId },
      update: { participantIds: JSON.stringify([...new Set([...participants, userId])]) },
      create: { tripId, participantIds: JSON.stringify([...new Set([...participants, userId])]) },
    });
  });

  await createNotification({
    userId: trip.creatorId,
    tripId,
    type: "MEMBER_JOINED",
    title: "有新成员加入",
    content: `${user.name} 加入了你的拼车。`,
  });

  if (nextCount >= trip.minMembers) {
    await notifyTripMembers(tripId, {
      type: "TRIP_CONFIRMED",
      title: "拼车已成团",
      content: "已达到最低成团人数，请完成费用承诺并保持沟通。",
    });
  }
  if (nextCount >= trip.maxMembers) {
    await notifyTripMembers(tripId, {
      type: "TRIP_FULL",
      title: "拼车已满员",
      content: "该拼车已达到最大人数，不再接受新成员。",
    });
  }

  return getTripById(tripId);
}

export async function leaveTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: tripInclude });
  if (!trip) throw new Error("行程不存在");
  const member = trip.members.find((item) => item.userId === userId);
  if (!member) throw new Error("你尚未加入该行程");
  if (member.role === "CREATOR") throw new Error("发起人不能直接退出，请取消行程");

  const nextCount = Math.max(1, trip.currentMembers - 1);
  const nextStatus = resolveTripStatus({ ...trip, currentMembers: nextCount }, await getDemoNow());
  await prisma.$transaction(async (tx) => {
    await tx.tripMember.update({
      where: { tripId_userId: { tripId, userId } },
      data: { memberStatus: "LEFT" },
    });
    await tx.trip.update({ where: { id: tripId }, data: { currentMembers: nextCount, status: nextStatus } });
    const participants = trip.members.filter((item) => item.userId !== userId).map((item) => item.userId);
    if (trip.conversation) {
      await tx.conversation.update({ where: { id: trip.conversation.id }, data: { participantIds: JSON.stringify(participants) } });
    }
    await tx.message.create({
      data: { conversationId: trip.conversation?.id ?? (await tx.conversation.findUniqueOrThrow({ where: { tripId } })).id, senderId: trip.creatorId, content: "有成员退出了本次拼车，请重新确认出行安排。" },
    }).catch(() => undefined);
  });

  await notifyTripMembers(tripId, {
    type: "MEMBER_LEFT",
    title: "拼车人数发生变化",
    content: "有成员退出，请重新确认出行安排。",
  });
  return getTripById(tripId);
}

export async function cancelTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: tripInclude });
  if (!trip) throw new Error("行程不存在");
  if (trip.creatorId !== userId) throw new Error("只有发起人可以取消行程");
  if (["COMPLETED", "TRAVELING", "CANCELLED"].includes(trip.status)) throw new Error("当前状态不能取消");
  await prisma.trip.update({ where: { id: tripId }, data: { status: "CANCELLED" } });
  await notifyTripMembers(tripId, {
    type: "TRIP_CANCELLED",
    title: "发起人已取消该拼车",
    content: "发起人已取消该拼车，请及时选择其他同行方案。",
  });
  return getTripById(tripId);
}

export async function updateTrip(tripId: string, userId: string, input: Partial<{
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  timeFlexibilityMinutes: number;
  maxMembers: number;
  deadlineMinutesBeforeDeparture: number;
  matchingScope: MatchingScope;
}>) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: tripInclude });
  if (!trip) throw new Error("行程不存在");
  if (trip.creatorId !== userId) throw new Error("只有发起人可以修改行程");
  if (["COMPLETED", "TRAVELING", "CANCELLED", "EXPIRED"].includes(trip.status)) throw new Error("当前状态不能修改核心信息");

  const date = input.departureDate ?? trip.departureDate.toISOString().slice(0, 10);
  const timeValue = input.departureTime ?? trip.departureTime;
  const departureAt = new Date(`${date}T${timeValue}:00+08:00`);
  const maxMembers = input.maxMembers ?? trip.maxMembers;
  if (maxMembers < trip.currentMembers || maxMembers <= trip.minMembers) throw new Error("最大人数不能低于当前人数，且必须大于最低成团人数");

  const coreChanged = Boolean(
    (input.origin && input.origin !== trip.origin) ||
    (input.destination && input.destination !== trip.destination) ||
    (input.departureDate && input.departureDate !== trip.departureDate.toISOString().slice(0, 10)) ||
    (input.departureTime && input.departureTime !== trip.departureTime) ||
    (input.maxMembers && input.maxMembers !== trip.maxMembers),
  );

  if (coreChanged) {
    await prisma.paymentCommitment.updateMany({ where: { tripId, userId: { not: userId } }, data: { status: "PENDING" } });
    await prisma.tripMember.updateMany({ where: { tripId, userId: { not: userId } }, data: { paymentStatus: "PENDING" } });
  }

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: {
      ...input,
      departureAt,
      departureDate: new Date(`${date}T00:00:00+08:00`),
      maxMembers,
    },
    include: tripInclude,
  });
  if (coreChanged) {
    await notifyTripMembers(tripId, {
      type: "TRIP_UPDATED",
      title: "拼车信息有更新",
      content: "出发路线、时间或人数发生变化，请重新确认出行安排。",
    });
  }
  return updated;
}

export async function searchTrips(filters: {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  school?: string;
  limit?: number;
}) {
  await refreshTripStatuses();
  const now = await getDemoNow();
  const date = filters.date ? new Date(`${filters.date}T00:00:00+08:00`) : null;
  const nextDate = date ? new Date(date.getTime() + 24 * 60 * 60_000) : null;
  const timeRange = filters.time ? {
    start: new Date(`${filters.date ?? now.toISOString().slice(0, 10)}T${filters.time}:00+08:00`),
  } : null;
  if (timeRange) timeRange.start = new Date(timeRange.start.getTime() - 120 * 60_000);
  const timeEnd = filters.time ? new Date(`${filters.date ?? now.toISOString().slice(0, 10)}T${filters.time}:00+08:00`) : null;
  if (timeEnd) timeEnd.setMinutes(timeEnd.getMinutes() + 120);

  return prisma.trip.findMany({
    where: {
      hiddenByAdmin: false,
      status: { in: ["PUBLISHED", "FORMING", "CONFIRMED", "FULL", "DEPARTURE_PENDING", "SOLO_MODE"] },
      ...(filters.origin ? { origin: { contains: filters.origin } } : {}),
      ...(filters.destination ? { destination: { contains: filters.destination } } : {}),
      ...(date && nextDate ? { departureAt: { gte: date, lt: nextDate } } : {}),
      ...(filters.school ? { school: { name: { contains: filters.school } } } : {}),
      ...(timeRange?.start && timeEnd ? { departureAt: { gte: timeRange.start, lte: timeEnd } } : {}),
    },
    include: {
      creator: true,
      school: true,
      members: { where: { memberStatus: "ACTIVE" }, include: { user: true } },
    },
    orderBy: [{ departureAt: "asc" }, { currentMembers: "desc" }],
    take: filters.limit ?? 30,
  });
}

export async function getSimilarTrips(tripId: string, limit = 3) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return [];
  return prisma.trip.findMany({
    where: {
      id: { not: tripId },
      hiddenByAdmin: false,
      status: { in: ["PUBLISHED", "FORMING", "CONFIRMED"] },
      OR: [{ destination: trip.destination }, { origin: trip.origin }],
    },
    include: { creator: true, school: true },
    orderBy: { departureAt: "asc" },
    take: limit,
  });
}

export async function completeTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: tripInclude });
  if (!trip) throw new Error("行程不存在");
  const member = trip.members.find((item) => item.userId === userId);
  if (!member) throw new Error("只有行程成员可以确认到达");
  if (!["TRAVELING", "DEPARTURE_PENDING", "CONFIRMED"].includes(trip.status)) throw new Error("当前行程还不能标记完成");

  await prisma.trip.update({ where: { id: tripId }, data: { status: "COMPLETED" } });
  await prisma.user.updateMany({
    where: { id: { in: trip.members.map((item) => item.userId) } },
    data: { tripCount: { increment: 1 } },
  });
  await notifyTripMembers(tripId, {
    type: "REVIEW_REQUIRED",
    title: "本次行程已完成",
    content: "评价你的车友，帮助校园拼车社区建立可信记录。",
  });
  return getTripById(tripId);
}

export async function startTraveling(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: tripInclude });
  if (!trip) throw new Error("行程不存在");
  const member = trip.members.find((item) => item.userId === userId);
  if (!member) throw new Error("只有行程成员可以开始行程");
  if (trip.status === "SOLO_MODE") return trip;
  if (!["CONFIRMED", "FULL", "DEPARTURE_PENDING"].includes(trip.status)) throw new Error("当前行程还不能开始");
  await prisma.trip.update({ where: { id: tripId }, data: { status: "TRAVELING" } });
  return getTripById(tripId);
}

