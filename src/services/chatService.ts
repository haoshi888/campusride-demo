import { prisma } from "@/lib/prisma";
import { SENSITIVE_WORDS } from "@/lib/constants";

export async function getOrCreateTripConversation(tripId: string) {
  const existing = await prisma.conversation.findUnique({ where: { tripId } });
  if (existing) return existing;
  const members = await prisma.tripMember.findMany({ where: { tripId, memberStatus: "ACTIVE" }, select: { userId: true } });
  return prisma.conversation.create({
    data: {
      tripId,
      type: "TRIP_GROUP",
      participantIds: JSON.stringify(members.map((member) => member.userId)),
    },
  });
}

export function scanMessage(content: string) {
  const found = SENSITIVE_WORDS.find((word) => content.includes(word));
  return found ? { safe: false, word: found } : { safe: true };
}

export async function listMessages(tripId: string) {
  const conversation = await getOrCreateTripConversation(tripId);
  return prisma.message.findMany({
    where: { conversationId: conversation.id },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}

export async function sendMessage(tripId: string, senderId: string, content: string) {
  const text = content.trim();
  if (!text) throw new Error("消息不能为空");
  if (!scanMessage(text).safe) throw new Error("请保持文明交流。");
  const conversation = await getOrCreateTripConversation(tripId);
  return prisma.message.create({
    data: { conversationId: conversation.id, senderId, content: text },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
}
