import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { CreateTripForm } from "@/components/create-trip-form";
import { VerificationCard } from "@/components/verification-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CreateTripPage() {
  const user = await requireUser();
  const verified = user.phoneVerified && user.schoolVerified && user.emailVerified;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft className="size-4" />返回首页</Link>
      <div className="mb-6">
        <p className="eyebrow">发布行程</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">发布我的拼车</h1>
        <p className="mt-2 text-sm text-slate-500">把需求结构化，让同校同路的同学更快找到你。</p>
      </div>
      {!verified ? (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <p>你还没有完成校园认证。可以浏览公开行程，但认证后才能发布或加入拼车。</p>
          </div>
          <VerificationCard email={user.email} verified={user.schoolVerified && user.emailVerified} />
          <Link href="/"><Button variant="outline" className="w-full">先去浏览拼车</Button></Link>
        </div>
      ) : (
        <CreateTripForm schoolName={user.school.name} />
      )}
    </div>
  );
}
