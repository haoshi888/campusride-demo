"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, ChevronRight, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { School } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

export function AuthForm({ schools }: { schools: School[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("13800000001");
  const [name, setName] = useState("王同学");
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send-phone", phone }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setStep("code");
      toast.success("Demo 验证码已发送：123456");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "验证码发送失败");
    } finally {
      setLoading(false);
    }
  }

  async function login(quick = false) {
    setLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", phone, name, schoolId, code: quick ? "123456" : code }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      toast.success(`欢迎回来，${data.user.name}`);
      router.push(searchParams.get("next") || "/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-black/5 bg-brand-50/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white"><ShieldCheck className="size-5" /></span>
          <div>
            <h1 className="text-xl font-black text-ink">登录 CampusRide</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">手机号快捷登录，再完成校园邮箱认证。Demo 不会发送真实短信。</p>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <label className="label">手机号</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" maxLength={11} className="pl-10" placeholder="请输入 11 位手机号" disabled={step === "code"} />
        </div>

        {step === "phone" ? (
          <>
            <label className="label mt-5">选择学校</label>
            <Select value={schoolId} onChange={(event) => setSchoolId(event.target.value)}>
              {schools.map((school) => <option key={school.id} value={school.id}>{school.name} · {school.city}</option>)}
            </Select>
            <label className="label mt-5">姓名</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="用于展示的姓名" />
            <Button className="mt-6 w-full" size="lg" onClick={sendCode} loading={loading} disabled={!phone || !schoolId}>发送 Demo 验证码 <ChevronRight className="size-4" /></Button>
          </>
        ) : (
          <>
            <label className="label mt-5">验证码</label>
            <Input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="输入 123456" />
            <div className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Demo 固定验证码：123456</div>
            <Button className="mt-6 w-full" size="lg" onClick={() => login(false)} loading={loading}>登录 / 注册</Button>
            <Button className="mt-3 w-full" variant="ghost" onClick={() => setStep("phone")}>修改手机号或学校</Button>
          </>
        )}

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-black/5" />面试演示快捷入口<span className="h-px flex-1 bg-black/5" /></div>
        <button onClick={() => { setPhone("13800000001"); setSchoolId(schools[0]?.id ?? ""); login(true); }} className="flex w-full items-center justify-between rounded-2xl border border-black/5 bg-slate-50 p-4 text-left transition hover:border-brand-200 hover:bg-brand-50">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-brand-100 font-black text-brand-800">王</span>
            <div>
              <p className="text-sm font-bold text-ink">以王同学身份进入</p>
              <p className="mt-0.5 text-xs text-slate-500">XX大学 · 已认证 · 管理员</p>
            </div>
          </div>
          <BadgeCheck className="size-5 text-brand-600" />
        </button>
      </div>
    </div>
  );
}
