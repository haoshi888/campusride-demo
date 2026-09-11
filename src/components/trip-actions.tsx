"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Car, Check, CheckCircle2, CreditCard, Loader2, LogOut, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { LuggageBadge } from "@/components/badges";
import { LUGGAGE_SIZE_OPTIONS, type TripStatus } from "@/lib/constants";

export function TripActions({
  tripId,
  status,
  currentUserId,
  isCreator,
  isMember,
  paymentStatus,
  isVerified,
  fare,
  maxMembers,
}: {
  tripId: string;
  status: TripStatus;
  currentUserId?: string;
  isCreator: boolean;
  isMember: boolean;
  paymentStatus?: string;
  isVerified: boolean;
  fare: number;
  maxMembers: number;
}) {
  const router = useRouter();
  const [joinOpen, setJoinOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [luggageCount, setLuggageCount] = useState(1);
  const [luggageSize, setLuggageSize] = useState("24寸左右");
  const [loading, setLoading] = useState(false);
  const [driverStage, setDriverStage] = useState<"idle" | "searching" | "found" | "arrived">("idle");
  const [paymentDone, setPaymentDone] = useState(paymentStatus === "CONFIRMED");

  async function action(name: string, body: Record<string, unknown> = {}) {
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: name, ...body }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function join() {
    try {
      await action("join", { luggageCount, luggageSizes: Array.from({ length: luggageCount }, () => luggageSize) });
      setJoinOpen(false);
      toast.success("已加入拼车，请确认模拟费用承诺");
      setPaymentOpen(true);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加入失败");
    }
  }

  async function confirmPayment() {
    setLoading(true);
    try {
      const response = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setPaymentDone(true);
      setPaymentOpen(false);
      toast.success("模拟费用承诺已确认，不会产生真实扣款");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "费用承诺失败");
    } finally {
      setLoading(false);
    }
  }

  async function leave() {
    try {
      await action("leave");
      setLeaveOpen(false);
      toast.success("已退出拼车");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "退出失败");
    }
  }

  async function cancel() {
    try {
      await action("cancel");
      setCancelOpen(false);
      toast.success("拼车已取消，成员已收到通知");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "取消失败");
    }
  }

  async function complete() {
    try {
      await action("complete");
      toast.success("本次行程已完成");
      router.push("/reviews");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "确认到达失败");
    }
  }

  async function startTraveling() {
    try {
      await action("start-traveling");
      toast.success("模拟行程已开始");
      setDriverOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "开始行程失败");
    }
  }

  if (!currentUserId) {
    return <Link href={`/login?next=/trips/${tripId}`}><Button size="lg" className="w-full">登录后申请加入</Button></Link>;
  }

  if (!isVerified) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-900">完成校园认证后才能加入</p>
        <p className="mt-1 text-xs leading-5 text-amber-800">当前可以浏览公开行程。认证只验证校园邮箱，不收集身份证件。</p>
        <Link href="/profile"><Button className="mt-4 w-full" variant="outline">去完成认证</Button></Link>
      </div>
    );
  }

  if (status === "SOLO_MODE") {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-center gap-3 text-rose-800"><AlertCircle className="size-5" /><p className="font-black">拼车未成功</p></div>
          <p className="mt-3 text-sm leading-6 text-rose-700">当前人数未达到最低成团人数，已切换为单独出行模式。Platform 未调用真实网约车 API。</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={() => toast.success("已确认单独出行")}>我知道了</Button>
            <Button onClick={() => toast.info("请自行打开常用打车应用叫车，本 Demo 不调用真实 API")}>查看行程</Button>
          </div>
        </div>
        {isCreator && <Button variant="danger" className="w-full" onClick={() => setCancelOpen(true)}>取消行程</Button>}
        <CancelModal open={cancelOpen} close={() => setCancelOpen(false)} loading={loading} onConfirm={cancel} />
      </div>
    );
  }

  if (status === "COMPLETED") {
    return <Link href="/reviews"><Button size="lg" className="w-full"><CheckCircle2 className="size-5" />评价你的车友</Button></Link>;
  }

  if (status === "CANCELLED" || status === "EXPIRED") {
    return <Button disabled className="w-full">该行程已结束</Button>;
  }

  if (isMember) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/chat/${tripId}`}><Button variant="outline" className="w-full"><MessageCircle className="size-4" />进入群聊</Button></Link>
          {!paymentDone && <Button onClick={() => setPaymentOpen(true)}><CreditCard className="size-4" />确认费用承诺</Button>}
          {paymentDone && <div className="flex items-center justify-center gap-2 rounded-2xl bg-brand-50 px-4 text-sm font-bold text-brand-700"><ShieldCheck className="size-4" />模拟费用已承诺</div>}
        </div>
        {["CONFIRMED", "FULL", "DEPARTURE_PENDING"].includes(status) && (
          <Button size="lg" className="w-full bg-ink hover:bg-black" onClick={() => setDriverOpen(true)}><Car className="size-5" />开始打车</Button>
        )}
        {status === "TRAVELING" && <Button size="lg" className="w-full" onClick={complete} loading={loading}><Check className="size-5" />确认已到达</Button>}
        {!isCreator && <Button variant="ghost" className="w-full text-red-600" onClick={() => setLeaveOpen(true)}><LogOut className="size-4" />退出拼车</Button>}
        {isCreator && <Button variant="ghost" className="w-full text-red-600" onClick={() => setCancelOpen(true)}>取消拼车</Button>}
        <PaymentModal open={paymentOpen} close={() => setPaymentOpen(false)} fare={fare} maxMembers={maxMembers} loading={loading} onConfirm={confirmPayment} />
        <CancelModal open={cancelOpen} close={() => setCancelOpen(false)} loading={loading} onConfirm={cancel} />
        <LeaveModal open={leaveOpen} close={() => setLeaveOpen(false)} loading={loading} onConfirm={leave} />
        <DriverModal
          open={driverOpen}
          close={() => setDriverOpen(false)}
          stage={driverStage}
          setStage={setDriverStage}
          loading={loading}
          onStartTraveling={startTraveling}
        />
      </div>
    );
  }

  if (["PUBLISHED", "FORMING"].includes(status)) {
    return (
      <div className="space-y-3">
        <Button size="lg" className="w-full" onClick={() => setJoinOpen(true)}><UserPlus className="size-5" />申请加入</Button>
        <p className="text-center text-xs text-slate-400">加入前会检查余位、重复加入、时间冲突和行李容量。</p>
        <JoinModal
          open={joinOpen}
          close={() => setJoinOpen(false)}
          loading={loading}
          luggageCount={luggageCount}
          luggageSize={luggageSize}
          setLuggageCount={setLuggageCount}
          setLuggageSize={setLuggageSize}
          onConfirm={join}
        />
        <PaymentModal open={paymentOpen} close={() => setPaymentOpen(false)} fare={fare} maxMembers={maxMembers} loading={loading} onConfirm={confirmPayment} />
      </div>
    );
  }

  if (status === "FULL") {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl bg-violet-50 p-4 text-sm font-semibold text-violet-800">该拼车已经满员。你可以查看其他相似行程。</div>
        <Link href="/search"><Button variant="outline" className="w-full">查看相似行程</Button></Link>
      </div>
    );
  }

  return <Button disabled className="w-full">当前状态不可加入</Button>;
}

function CancelModal({ open, close, loading, onConfirm }: { open: boolean; close: () => void; loading: boolean; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={close} title="取消这次拼车？" description="取消后，所有成员都会收到站内通知。">
      <div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={close}>保留行程</Button><Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>确认取消</Button></div>
    </Modal>
  );
}

function LeaveModal({ open, close, loading, onConfirm }: { open: boolean; close: () => void; loading: boolean; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={close} title="退出这次拼车？" description="退出后人数会重新计算；如果低于最低成团人数，状态会回到招募中。">
      <div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={close}>继续同行</Button><Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>确认退出</Button></div>
    </Modal>
  );
}

function JoinModal({
  open,
  close,
  loading,
  luggageCount,
  luggageSize,
  setLuggageCount,
  setLuggageSize,
  onConfirm,
}: {
  open: boolean;
  close: () => void;
  loading: boolean;
  luggageCount: number;
  luggageSize: string;
  setLuggageCount: (count: number) => void;
  setLuggageSize: (size: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={close} title="确认同行信息" description="系统会检查余位、时间冲突和行李容量。">
      <div className="space-y-4">
        <div><label className="label">乘车人数</label><Input value="1 人" disabled /></div>
        <div><label className="label">行李数量</label><Select value={luggageCount} onChange={(event) => setLuggageCount(Number(event.target.value))}>{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={count}>{count} 件</option>)}</Select></div>
        {luggageCount > 0 && <div><label className="label">主要行李尺寸</label><Select value={luggageSize} onChange={(event) => setLuggageSize(event.target.value)}>{LUGGAGE_SIZE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</Select></div>}
        <div className="rounded-2xl bg-slate-50 p-4"><LuggageBadge count={luggageCount} /></div>
        <Button className="w-full" size="lg" onClick={onConfirm} loading={loading}>确认并加入</Button>
      </div>
    </Modal>
  );
}

function PaymentModal({ open, close, fare, maxMembers, loading, onConfirm }: { open: boolean; close: () => void; fare: number; maxMembers: number; loading: boolean; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={close} title="模拟费用承诺" description="本 Demo 为模拟支付，不产生真实扣款。">
      <div className="rounded-3xl bg-ink p-5 text-white">
        <p className="text-xs font-semibold text-white/60">预计人均费用</p>
        <p className="mt-2 text-4xl font-black">¥{fare}<span className="text-base font-semibold text-white/60"> / 人</span></p>
        <p className="mt-3 text-xs leading-5 text-white/50">按最多 {maxMembers} 人估算，实际费用以最终打车订单为准。</p>
      </div>
      <div className="mt-5 space-y-3">
        <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />点击只更新 PaymentCommitment.status，不会调用微信、支付宝或银行卡。</p>
        <Button className="w-full" size="lg" onClick={onConfirm} loading={loading}><CreditCard className="size-4" />确认费用承诺</Button>
      </div>
    </Modal>
  );
}

function DriverModal({
  open,
  close,
  stage,
  setStage,
  loading,
  onStartTraveling,
}: {
  open: boolean;
  close: () => void;
  stage: "idle" | "searching" | "found" | "arrived";
  setStage: (stage: "idle" | "searching" | "found" | "arrived") => void;
  loading: boolean;
  onStartTraveling: () => void;
}) {
  function search() {
    setStage("searching");
    window.setTimeout(() => setStage("found"), 900);
    window.setTimeout(() => setStage("arrived"), 1900);
  }

  return (
    <Modal open={open} onClose={close} title="模拟叫车" description="所有司机、车型和车牌均为 Demo 模拟数据。">
      {stage === "idle" && <Button className="w-full" size="lg" onClick={search}><Car className="size-5" />开始打车</Button>}
      {stage === "searching" && <div className="py-8 text-center"><Loader2 className="mx-auto size-8 animate-spin text-brand-600" /><p className="mt-4 font-bold">正在寻找司机…</p><p className="mt-1 text-xs text-slate-400">仅模拟，不接入真实网约车 API</p></div>}
      {(stage === "found" || stage === "arrived") && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-brand-100 bg-brand-50 p-5">
            <div className="flex items-center justify-between"><span className="font-black text-brand-900">司机：李师傅</span><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700">Demo 模拟</span></div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-3"><p className="text-xs text-slate-400">车型</p><p className="mt-1 font-bold">舒适型</p></div>
              <div className="rounded-2xl bg-white p-3"><p className="text-xs text-slate-400">车牌</p><p className="mt-1 font-bold">沪A·12345</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-500">预计到达</span><span className="font-black text-brand-800">{stage === "found" ? "5 分钟" : "已到达上车点"}</span></div>
          </div>
          {stage === "found" && <Button variant="outline" className="w-full" disabled><Loader2 className="size-4 animate-spin" />车辆正在赶来</Button>}
          {stage === "arrived" && <div className="space-y-3"><div className="flex items-center justify-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700"><CheckCircle2 className="size-4" />已核对车牌</div><Button className="w-full" onClick={onStartTraveling} loading={loading}>开始行程</Button></div>}
        </div>
      )}
    </Modal>
  );
}
