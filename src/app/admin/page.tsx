import { requireAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-3xl bg-ink text-white"><Shield className="size-6" /></span><div><p className="eyebrow">管理员后台</p><h1 className="mt-1 text-3xl font-black tracking-tight">安全治理 Dashboard</h1><p className="mt-1 text-sm text-slate-500">用户、Trip 与举报处理，仅供 Demo 展示。</p></div></div>
      <AdminDashboard />
    </div>
  );
}
