import { Suspense } from "react";
import { CarFront, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AuthForm } from "@/components/auth-form";
import { LoadingState } from "@/components/loading-state";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid min-h-screen gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-10">
      <div className="mx-auto w-full max-w-xl lg:ml-auto">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-3xl bg-brand-600 text-white shadow-float"><CarFront className="size-6" /></span>
          <div>
            <p className="text-2xl font-black tracking-tight">CampusRide</p>
            <p className="text-sm text-slate-500">校园同校拼车</p>
          </div>
        </div>
        <h2 className="text-balance text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl">找到可信的同行者，<br />而不是只叫一辆车。</h2>
        <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">结构化行程、校园认证、同校优先和可解释的规则匹配，帮助学生更省钱、更安心地往返机场与高铁站。</p>
        <div className="mt-8 space-y-3">
          {["Demo 固定验证码，无需等待真实短信", "未完成校园认证只能浏览", "所有费用均为模拟承诺，无真实扣款"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700"><ShieldCheck className="size-4 text-brand-600" />{item}</div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-lg lg:mr-auto">
        <Suspense fallback={<LoadingState label="正在准备登录…" />}><AuthForm schools={schools} /></Suspense>
      </div>
    </div>
  );
}
