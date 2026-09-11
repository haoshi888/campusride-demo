"use client";

import { useState } from "react";
import { Flag, ShieldOff, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, Textarea } from "@/components/ui/input";
import { REPORT_TYPES } from "@/lib/constants";

export function SafetyActions({ tripId, targetUserId, targetName }: { tripId: string; targetUserId: string; targetName: string }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(REPORT_TYPES[0]);
  const [description, setDescription] = useState("");

  async function report() {
    setLoading(true);
    try {
      const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, reportedUserId: targetUserId, type, description }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      toast.success("举报已提交，管理员会尽快处理");
      setReportOpen(false);
      setDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "举报提交失败");
    } finally {
      setLoading(false);
    }
  }

  async function block() {
    setLoading(true);
    try {
      const response = await fetch("/api/blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: targetUserId }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      toast.success(`已拉黑 ${targetName}，后续将不再推荐`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "拉黑失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => setReportOpen(true)}><Flag className="size-4" />举报</Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={block} loading={loading}><UserRoundX className="size-4" />拉黑</Button>
      </div>
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={`举报 ${targetName}`} description="举报内容会进入管理员后台，Demo 不会自动处罚用户。">
        <div className="space-y-4">
          <div><label className="label">举报类型</label><Select value={type} onChange={(event) => setType(event.target.value)}>{REPORT_TYPES.map((item) => <option key={item}>{item}</option>)}</Select></div>
          <div><label className="label">补充说明</label><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="请描述具体情况（至少 5 个字）" /></div>
          <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><ShieldOff className="mt-0.5 size-4 shrink-0" />如涉及人身安全，请优先联系平台管理人员或报警。</div>
          <Button className="w-full" variant="danger" onClick={report} loading={loading} disabled={description.trim().length < 5}>提交举报</Button>
        </div>
      </Modal>
    </>
  );
}
