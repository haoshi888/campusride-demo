"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, CarFront, CheckCircle2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/loading-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TripStatusBadge } from "@/components/badges";
import { cn } from "@/lib/utils";

type AdminData = {
  stats: { userCount: number; verifiedCount: number; activeTrips: number; completedMembers: number; pendingReports: number };
  users: Array<{ id: string; name: string; phone: string; school: { name: string }; schoolVerified: boolean; isDisabled: boolean; rating: number; tripCount: number }>;
  trips: Array<{ id: string; origin: string; destination: string; status: string; currentMembers: number; maxMembers: number; creator: { name: string }; school: { name: string } }>;
  reports: Array<{ id: string; type: string; description: string; status: string; reporter: { name: string }; reportedUser?: { name: string } | null; trip?: { origin: string; destination: string } | null }>;
};

export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<"overview" | "users" | "trips" | "reports">("overview");
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch("/api/admin");
    const result = await response.json();
    if (result.ok) setData(result);
    else toast.error(result.error);
  }

  useEffect(() => { load(); }, []);

  async function action(body: Record<string, unknown>) {
    setLoading(true);
    try {
      const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error);
      toast.success("管理操作已完成");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "管理操作失败");
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <LoadingState label="正在加载管理后台…" />;

  const stats = [
    ["注册用户", data.stats.userCount, UserRound],
    ["认证用户", data.stats.verifiedCount, BadgeCheck],
    ["活跃 Trip", data.stats.activeTrips, CarFront],
    ["成功拼车人数", data.stats.completedMembers, Users],
    ["待处理举报", data.stats.pendingReports, AlertTriangle],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map(([label, value, Icon]) => (
          <Card key={label} className="p-4"><Icon className="size-4 text-brand-600" /><p className="mt-3 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></Card>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {([["overview", "Dashboard"], ["users", "用户管理"], ["trips", "Trip 管理"], ["reports", "举报处理"]] as const).map(([key, label]) => <Button key={key} variant={tab === key ? "primary" : "outline"} size="sm" onClick={() => setTab(key)}>{label}</Button>)}
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5"><h2 className="font-black">最近用户</h2><div className="mt-4 space-y-3">{data.users.slice(0, 4).map((user) => <div key={user.id} className="flex items-center justify-between text-sm"><span>{user.name} · {user.school.name}</span><span className="text-slate-400">⭐ {user.rating.toFixed(1)}</span></div>)}</div></Card>
          <Card className="p-5"><h2 className="font-black">待处理举报</h2><div className="mt-4 space-y-3">{data.reports.filter((item) => item.status === "PENDING").slice(0, 4).map((report) => <div key={report.id} className="rounded-2xl bg-amber-50 p-3 text-sm"><p className="font-bold text-amber-900">{report.type}</p><p className="mt-1 line-clamp-2 text-xs text-amber-700">{report.description}</p></div>)}</div></Card>
        </div>
      )}

      {tab === "users" && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-black/5 bg-slate-50 text-xs text-slate-500"><tr><th className="p-4">用户</th><th>学校</th><th>认证</th><th>评分</th><th className="pr-4 text-right">状态 / 操作</th></tr></thead><tbody>{data.users.map((user) => <tr key={user.id} className="border-b border-black/5 last:border-0"><td className="p-4 font-bold">{user.name}</td><td>{user.school.name}</td><td>{user.schoolVerified ? "已认证" : "未认证"}</td><td>⭐ {user.rating.toFixed(1)}</td><td className="pr-4 text-right"><span className={cn("mr-3 text-xs font-bold", user.isDisabled ? "text-red-600" : "text-brand-600")}>{user.isDisabled ? "已禁用" : "正常"}</span><Button size="sm" variant={user.isDisabled ? "outline" : "danger"} onClick={() => action({ action: "toggle-user", userId: user.id, disabled: !user.isDisabled })}>{user.isDisabled ? "恢复" : "禁用"}</Button></td></tr>)}</tbody></table>
        </Card>
      )}

      {tab === "trips" && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/5 bg-slate-50 text-xs text-slate-500"><tr><th className="p-4">路线</th><th>学校</th><th>发起人</th><th>人数</th><th>状态</th><th className="pr-4 text-right">操作</th></tr></thead><tbody>{data.trips.map((trip) => <tr key={trip.id} className="border-b border-black/5 last:border-0"><td className="p-4 font-bold">{trip.origin} → {trip.destination}</td><td>{trip.school.name}</td><td>{trip.creator.name}</td><td>{trip.currentMembers}/{trip.maxMembers}</td><td><TripStatusBadge status={trip.status} /></td><td className="pr-4 text-right"><Button size="sm" variant="danger" onClick={() => action({ action: "hide-trip", tripId: trip.id })}>删除违规 Trip</Button></td></tr>)}</tbody></table>
        </Card>
      )}

      {tab === "reports" && (
        <div className="grid gap-4 lg:grid-cols-2">{data.reports.map((report) => <Card key={report.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-black">{report.type}</p><p className="mt-1 text-xs text-slate-500">举报人 {report.reporter.name} · 被举报 {report.reportedUser?.name ?? "行程信息"}</p></div><span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", report.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-brand-50 text-brand-700")}>{report.status}</span></div><p className="mt-4 text-sm leading-6 text-slate-600">{report.description}</p>{report.trip && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">{report.trip.origin} → {report.trip.destination}</p>}<div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => action({ action: "report-status", reportId: report.id, status: "REJECTED" })}>驳回</Button><Button size="sm" onClick={() => action({ action: "report-status", reportId: report.id, status: "RESOLVED", adminNote: "已核实并处理" })}><CheckCircle2 className="size-4" />标记处理</Button></div></Card>)}</div>
      )}
      {loading && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white shadow-float">正在执行管理操作…</div>}
    </div>
  );
}
