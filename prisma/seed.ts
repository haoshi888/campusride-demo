import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";

const prisma = new PrismaClient();
const DEMO_DAY = new Date("2026-09-20T00:00:00+08:00");

function at(dayOffset: number, hour: number, minute = 0) {
  const date = new Date(DEMO_DAY);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function dateOnly(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function time(value: Date) {
  return value.toISOString().slice(11, 16);
}

export async function seedDatabase() {
  await prisma.block.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.paymentCommitment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.tripMember.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const [xx, yy, zz] = await Promise.all([
    prisma.school.create({ data: { name: "XX大学", city: "上海", emailDomains: JSON.stringify(["xx.edu.cn"]) } }),
    prisma.school.create({ data: { name: "YY大学", city: "上海", emailDomains: JSON.stringify(["yy.edu.cn"]) } }),
    prisma.school.create({ data: { name: "ZZ大学", city: "北京", emailDomains: JSON.stringify(["zz.edu.cn"]) } }),
  ]);

  const [wang, li, chen, zhao, sun] = await Promise.all([
    prisma.user.create({ data: { id: "user_wang", name: "王同学", phone: "13800000001", phoneVerified: true, schoolId: xx.id, schoolVerified: true, email: "wang@xx.edu.cn", emailVerified: true, rating: 4.9, tripCount: 12, punctualityRate: 96, isAdmin: true } }),
    prisma.user.create({ data: { id: "user_li", name: "李同学", phone: "13800000002", phoneVerified: true, schoolId: xx.id, schoolVerified: true, email: "li@xx.edu.cn", emailVerified: true, rating: 4.8, tripCount: 8, punctualityRate: 98 } }),
    prisma.user.create({ data: { id: "user_chen", name: "陈同学", phone: "13800000003", phoneVerified: true, schoolId: zz.id, schoolVerified: true, email: "chen@zz.edu.cn", emailVerified: true, rating: 4.7, tripCount: 16, punctualityRate: 92 } }),
    prisma.user.create({ data: { id: "user_zhao", name: "赵同学", phone: "13800000004", phoneVerified: true, schoolId: yy.id, schoolVerified: true, email: "zhao@yy.edu.cn", emailVerified: true, rating: 4.9, tripCount: 5, punctualityRate: 100 } }),
    prisma.user.create({ data: { id: "user_sun", name: "孙同学", phone: "13800000005", phoneVerified: true, schoolId: xx.id, schoolVerified: false, email: "sun@xx.edu.cn", emailVerified: false, rating: 5, tripCount: 0, punctualityRate: 100 } }),
    prisma.user.create({ data: { id: "user_zhou", name: "周同学", phone: "13800000006", phoneVerified: true, schoolId: xx.id, schoolVerified: true, email: "zhou@xx.edu.cn", emailVerified: true, rating: 4.9, tripCount: 3, punctualityRate: 99 } }),
  ]);

  const routes = [
    { key: "confirmed", creatorId: wang.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(0, 18), status: "CONFIRMED", min: 2, max: 3, luggage: [24, 20], oversized: false, members: [wang, li], fare: [100, 140], scope: "SCHOOL" },
    { key: "forming", creatorId: li.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(0, 18, 20), status: "FORMING", min: 2, max: 3, luggage: [28], oversized: true, members: [li], fare: [96, 132], scope: "SCHOOL" },
    { key: "nearfull", creatorId: zhao.id, schoolId: yy.id, origin: "虹桥火车站", destination: "YY大学", when: at(0, 19, 10), status: "FORMING", min: 2, max: 3, luggage: [20, 28], oversized: false, members: [zhao, chen], fare: [70, 98], scope: "CITY" },
    { key: "cross", creatorId: chen.id, schoolId: zz.id, origin: "浦东国际机场", destination: "ZZ大学", when: at(0, 18), status: "FORMING", min: 2, max: 4, luggage: [20, 24], oversized: false, members: [chen, zhao], fare: [150, 190], scope: "ALL" },
    { key: "full", creatorId: li.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(0, 21, 20), status: "FULL", min: 2, max: 3, luggage: [20, 20, 24], oversized: false, members: [li, chen, zhao], fare: [110, 150], scope: "SCHOOL" },
    { key: "over43", creatorId: wang.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(0, 20, 30), status: "FORMING", min: 3, max: 4, luggage: [28, 28], oversized: true, members: [wang, chen], fare: [100, 142], scope: "CITY" },
    { key: "tomorrow", creatorId: zhao.id, schoolId: yy.id, origin: "YY大学", destination: "虹桥火车站", when: at(1, 9, 30), status: "PUBLISHED", min: 2, max: 3, luggage: [24], oversized: false, members: [zhao], fare: [75, 105], scope: "SCHOOL" },
    { key: "tomorrow2", creatorId: chen.id, schoolId: zz.id, origin: "北京南站", destination: "ZZ大学", when: at(1, 16, 40), status: "CONFIRMED", min: 2, max: 4, luggage: [20, 24], oversized: false, members: [chen, wang], fare: [90, 125], scope: "ALL" },
    { key: "pending", creatorId: wang.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(0, 17, 10), status: "DEPARTURE_PENDING", min: 2, max: 3, luggage: [28], oversized: true, members: [wang, li], fare: [90, 128], scope: "SCHOOL" },
    { key: "traveling", creatorId: li.id, schoolId: xx.id, origin: "XX大学", destination: "虹桥火车站", when: at(0, 15, 30), status: "TRAVELING", min: 2, max: 3, luggage: [20, 24], oversized: false, members: [li, zhao], fare: [70, 95], scope: "CITY" },
    { key: "completed", creatorId: wang.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(-1, 20), status: "COMPLETED", min: 2, max: 3, luggage: [24], oversized: false, members: [wang, chen], fare: [105, 140], scope: "SCHOOL" },
    { key: "solo", creatorId: sun.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(0, 16), status: "SOLO_MODE", min: 2, max: 3, luggage: [28], oversized: true, members: [sun], fare: [88, 120], scope: "SCHOOL" },
    { key: "cancelled", creatorId: chen.id, schoolId: zz.id, origin: "北京南站", destination: "ZZ大学", when: at(2, 14), status: "CANCELLED", min: 2, max: 3, luggage: [20], oversized: false, members: [chen], fare: [80, 110], scope: "SCHOOL" },
    { key: "day3", creatorId: wang.id, schoolId: xx.id, origin: "浦东国际机场", destination: "XX大学", when: at(2, 22), status: "PUBLISHED", min: 2, max: 3, luggage: [], oversized: false, members: [wang], fare: [115, 155], scope: "SCHOOL" },
  ];

  const tripMap: Record<string, { id: string }> = {};
  for (const item of routes) {
    const trip = await prisma.trip.create({
      data: {
        id: `trip_${item.key}`,
        creatorId: item.creatorId,
        schoolId: item.schoolId,
        origin: item.origin,
        destination: item.destination,
        departureDate: dateOnly(item.when),
        departureTime: time(item.when),
        departureAt: item.when,
        timeFlexibilityMinutes: item.members.length > 1 ? 15 : 30,
        currentMembers: item.members.length,
        minMembers: item.min,
        maxMembers: item.max,
        luggageCount: item.luggage.length,
        luggageSizes: JSON.stringify(item.luggage),
        hasOversizedLuggage: item.oversized,
        matchingScope: item.scope,
        deadlineMinutesBeforeDeparture: 60,
        status: item.status,
        estimatedTotalFareMin: item.fare[0],
        estimatedTotalFareMax: item.fare[1],
      },
    });
    tripMap[item.key] = trip;
    for (let index = 0; index < item.members.length; index += 1) {
      const member = item.members[index];
      await prisma.tripMember.create({
        data: {
          tripId: trip.id,
          userId: member.id,
          role: index === 0 ? "CREATOR" : "MEMBER",
          luggageCount: item.luggage[index] ?? 0,
          luggageSizes: JSON.stringify(item.luggage[index] ? [item.luggage[index]] : []),
          paymentStatus: index < item.members.length ? "CONFIRMED" : "PENDING",
        },
      });
    }
  }

  await prisma.conversation.create({
    data: {
      tripId: tripMap.confirmed.id,
      participantIds: JSON.stringify([wang.id, li.id]),
      messages: {
        create: [
          { senderId: wang.id, content: "我18:00左右到行李转盘，可以一起走。" },
          { senderId: li.id, content: "好呀，我拿完行李在3号门等你。" },
        ],
      },
    },
  });
  await prisma.conversation.create({
    data: {
      tripId: tripMap.forming.id,
      participantIds: JSON.stringify([li.id]),
      messages: { create: [{ senderId: li.id, content: "有同路同学可以直接在这里联系我。" }] },
    },
  });

  await prisma.paymentCommitment.createMany({
    data: routes
      .filter((item) => item.members.length)
      .flatMap((item) => item.members.map((member) => ({
        tripId: tripMap[item.key].id,
        userId: member.id,
        amount: Math.round(((item.fare[0] + item.fare[1]) / 2) / item.max),
        status: "CONFIRMED",
      }))),
  });

  await prisma.notification.createMany({
    data: [
      { userId: wang.id, tripId: tripMap.confirmed.id, type: "TRIP_CONFIRMED", title: "拼车已成团", content: "9月20日 18:00 浦东国际机场 → XX大学 已满足最低成团人数。" },
      { userId: li.id, tripId: tripMap.confirmed.id, type: "MEMBER_JOINED", title: "新成员加入", content: "王同学加入了你的拼车。" },
      { userId: wang.id, tripId: tripMap.pending.id, type: "DEPARTURE_REMINDER", title: "行程即将出发", content: "请确认行程并准备开始打车。" },
      { userId: sun.id, tripId: tripMap.solo.id, type: "SOLO_MODE", title: "已切换为单独出行", content: "当前未达到最低成团人数，已切换为单独出行模式。" },
    ],
  });

  await prisma.review.create({
    data: {
      tripId: tripMap.completed.id,
      reviewerId: wang.id,
      revieweeId: chen.id,
      rating: 5,
      tags: JSON.stringify(["守时", "好沟通", "可靠"]),
      comment: "沟通很及时，行李安排也很顺利。",
    },
  });

  await prisma.report.create({
    data: { reporterId: li.id, reportedUserId: chen.id, tripId: tripMap.cross.id, type: "虚假信息", description: "出发时间与描述不一致，等待管理员核实。" },
  });

  await prisma.user.update({
    where: { id: chen.id },
    data: { rating: 4.8, tripCount: 17, punctualityRate: 93 },
  });

  console.log("CampusRide demo data seeded.");
  console.log("Demo users: 13800000001 ~ 13800000006, code 123456");
}

export async function closeSeedDatabase() {
  await prisma.$disconnect();
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(closeSeedDatabase);
}


