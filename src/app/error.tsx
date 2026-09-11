"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="surface mx-auto mt-16 max-w-lg p-8 text-center">
      <AlertTriangle className="mx-auto size-9 text-amber-500" />
      <h1 className="mt-4 text-xl font-black">页面加载失败</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">网络连接失败，或行程信息已更新。请刷新后重试。</p>
      <Button className="mt-5" onClick={reset}>重新加载</Button>
    </div>
  );
}
