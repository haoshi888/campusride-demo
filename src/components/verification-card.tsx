"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerificationCard({ email, verified }: { email?: string | null; verified: boolean }) {
  const router = useRouter();
  const [emailValue, setEmailValue] = useState(email ?? "");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send-email", email: emailValue }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setSent(true);
      toast.success("校园邮箱 Demo 验证码：888888");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "验证码发送失败");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify-email", code }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      toast.success("校园邮箱认证成功");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "认证失败");
    } finally {
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div className="surface flex items-center gap-4 p-5">
        <span className="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700"><MailCheck className="size-5" /></span>
        <div>
          <p className="font-bold text-ink">校园邮箱已认证</p>
          <p className="mt-1 text-sm text-slate-500">{email} · 可发布和加入行程</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-amber-50 text-amber-700"><GraduationCap className="size-5" /></span>
        <div>
          <p className="font-bold text-ink">完成校园认证</p>
          <p className="text-sm text-slate-500">认证后才能发布或加入拼车。</p>
        </div>
      </div>
      <div className="mt-5">
        <label className="label">校园邮箱</label>
        <Input value={emailValue} onChange={(event) => setEmailValue(event.target.value)} placeholder="name@xx.edu.cn" disabled={sent} />
        {sent && (
          <>
            <label className="label mt-4">邮箱验证码</label>
            <Input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Demo 验证码 888888" />
          </>
        )}
        <Button className="mt-4 w-full" onClick={sent ? verify : sendCode} loading={loading}>{sent ? "确认认证" : "发送验证码"}</Button>
      </div>
    </div>
  );
}
