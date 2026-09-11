"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { REVIEW_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Reviewee = { id: string; name: string };

export function ReviewForm({ tripId, reviewees }: { tripId: string; reviewees: Reviewee[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState(() => reviewees.map((user) => ({ revieweeId: user.id, rating: 5, tags: [] as string[], comment: "" })));

  function update(index: number, patch: Partial<(typeof reviews)[number]>) {
    setReviews((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function toggleTag(index: number, tag: string) {
    const current = reviews[index].tags;
    update(index, { tags: current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag] });
  }

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, reviews }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      toast.success("评价已提交，用户统计已更新");
      router.push("/my-trips");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交评价失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {reviewees.map((user, index) => (
        <div key={user.id} className="rounded-3xl border border-black/5 p-4">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-brand-100 font-black text-brand-800">{user.name.slice(0, 1)}</span><p className="font-black text-ink">{user.name}</p></div>
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} onClick={() => update(index, { rating })} aria-label={`${rating} 星`}><Star className={cn("size-8", rating <= reviews[index].rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} /></button>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...REVIEW_TAGS.positive, ...REVIEW_TAGS.negative].map((tag) => <button type="button" key={tag} onClick={() => toggleTag(index, tag)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", reviews[index].tags.includes(tag) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-black/10 text-slate-500")}>{tag}</button>)}
          </div>
          <Textarea className="mt-4" value={reviews[index].comment} onChange={(event) => update(index, { comment: event.target.value })} placeholder="补充评价（可选）" />
        </div>
      ))}
      <Button size="lg" className="w-full" onClick={submit} loading={loading}>提交评价</Button>
    </div>
  );
}
