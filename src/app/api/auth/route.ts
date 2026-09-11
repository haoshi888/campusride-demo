import { NextResponse } from "next/server";
import { loginWithPhone, requestEmailCode, requestPhoneCode, verifyCampusEmail } from "@/services/authService";
import { getCurrentUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";
import { apiError, readJson } from "@/lib/api";

type AuthBody = {
  action: string;
  phone?: string;
  code?: string;
  schoolId?: string;
  name?: string;
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<AuthBody>(request);

    if (body.action === "send-phone") {
      const result = await requestPhoneCode(body.phone ?? "");
      return NextResponse.json({ ok: true, ...result, message: "Demo 验证码已发送：123456" });
    }

    if (body.action === "login") {
      const user = await loginWithPhone({
        phone: body.phone ?? "",
        code: body.code ?? "",
        schoolId: body.schoolId ?? "",
        name: body.name,
      });
      const response = NextResponse.json({ ok: true, user });
      response.cookies.set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 14, path: "/" });
      return response;
    }

    if (body.action === "send-email") {
      const user = await getCurrentUser();
      if (!user) throw new Error("请先登录");
      const result = await requestEmailCode(user.id, body.email ?? "");
      return NextResponse.json({ ok: true, ...result, message: "校园邮箱验证码已发送：888888" });
    }

    if (body.action === "verify-email") {
      const user = await getCurrentUser();
      if (!user) throw new Error("请先登录");
      const updated = await verifyCampusEmail(user.id, body.code ?? "");
      return NextResponse.json({ ok: true, user: updated });
    }

    if (body.action === "logout") {
      const response = NextResponse.json({ ok: true });
      response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", maxAge: 0, path: "/" });
      return response;
    }

    throw new Error("不支持的操作");
  } catch (error) {
    return apiError(error);
  }
}
