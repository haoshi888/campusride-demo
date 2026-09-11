import { prisma } from "@/lib/prisma";
import { DEMO_EMAIL_CODE, DEMO_PHONE_CODE } from "@/lib/constants";

export async function requestPhoneCode(phone: string) {
  if (!/^1\d{10}$/.test(phone)) throw new Error("请输入正确的手机号");
  return { success: true, code: DEMO_PHONE_CODE };
}

export async function loginWithPhone(input: { phone: string; code: string; schoolId: string; name?: string }) {
  if (input.code !== DEMO_PHONE_CODE) throw new Error("验证码不正确，Demo 验证码为 123456");
  const school = await prisma.school.findUnique({ where: { id: input.schoolId } });
  if (!school) throw new Error("请选择有效学校");

  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing?.isDisabled) throw new Error("该账号已被管理员禁用");
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { phoneVerified: true },
      include: { school: true },
    });
  }

  return prisma.user.create({
    data: {
      name: input.name?.trim() || `${input.phone.slice(-4)}同学`,
      phone: input.phone,
      phoneVerified: true,
      schoolId: input.schoolId,
      schoolVerified: false,
      emailVerified: false,
    },
    include: { school: true },
  });
}

export async function requestEmailCode(userId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { school: true } });
  if (!user) throw new Error("请先登录");
  const domains = JSON.parse(user.school.emailDomains) as string[];
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || !domains.includes(domain)) {
    throw new Error(`请使用 ${user.school.name} 的校园邮箱（${domains.map((item) => "@" + item).join("、")}）`);
  }
  await prisma.user.update({ where: { id: userId }, data: { email } });
  return { success: true, code: DEMO_EMAIL_CODE };
}

export async function verifyCampusEmail(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("请先登录");
  if (!user.email) throw new Error("请先填写校园邮箱");
  if (code !== DEMO_EMAIL_CODE) throw new Error("校园邮箱验证码不正确，Demo 验证码为 888888");
  return prisma.user.update({
    where: { id: userId },
    data: { schoolVerified: true, emailVerified: true },
    include: { school: true },
  });
}
