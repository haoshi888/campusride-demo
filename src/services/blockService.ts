import { prisma } from "@/lib/prisma";

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) throw new Error("不能拉黑自己");
  return prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    update: {},
    create: { blockerId, blockedId },
  });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  return prisma.block.deleteMany({ where: { blockerId, blockedId } });
}
