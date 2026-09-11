import Link from "next/link";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="surface mx-auto mt-16 max-w-lg p-8 text-center">
      <MapPinned className="mx-auto size-10 text-brand-600" />
      <h1 className="mt-4 text-2xl font-black">没有找到这个页面</h1>
      <p className="mt-2 text-sm text-slate-500">链接可能已失效，或行程已被取消。</p>
      <Link href="/"><Button className="mt-5">返回首页</Button></Link>
    </div>
  );
}
