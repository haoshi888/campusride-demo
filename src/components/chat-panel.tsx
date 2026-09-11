"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SENSITIVE_WORDS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

type MessageItem = {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
};

export function ChatPanel({ tripId, currentUserId, initialMessages }: { tripId: string; currentUserId: string; initialMessages: MessageItem[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/chat/${tripId}`);
    const data = await response.json();
    if (data.ok) setMessages(data.messages);
  }, [tripId]);

  useEffect(() => {
    const timer = window.setInterval(load, 4000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/${tripId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setMessages((items) => [...items, data.message]);
      setContent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "消息发送失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="surface flex h-[calc(100vh-11rem)] min-h-[34rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-brand-100 text-brand-700"><MessageCircle className="size-5" /></span><div><p className="font-black text-ink">行程群聊</p><p className="text-xs text-slate-400">{messages.length} 条消息 · Demo 站内聊天</p></div></div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700"><ShieldCheck className="size-3.5" />基础敏感词检测</span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-5">
        {messages.length === 0 && <div className="grid h-full place-items-center text-center"><div><MessageCircle className="mx-auto size-8 text-slate-300" /><p className="mt-3 font-bold text-slate-500">暂时没有其他成员。</p><p className="mt-1 text-xs text-slate-400">可以发送第一条消息，提前沟通到达时间和行李。</p></div></div>}
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] ${mine ? "text-right" : "text-left"}`}>
                {!mine && <p className="mb-1 px-1 text-xs font-semibold text-slate-500">{message.sender.name}</p>}
                <div className={`rounded-3xl px-4 py-3 text-sm leading-6 ${mine ? "rounded-br-lg bg-brand-600 text-white" : "rounded-bl-lg bg-white text-ink shadow-sm"}`}>{message.content}</div>
                <p className="mt-1 px-1 text-[10px] text-slate-400">{formatTime(message.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-black/5 bg-white p-3 sm:p-4">
        <div className="flex gap-2">
          <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="礼貌沟通，保护个人隐私…" maxLength={300} />
          <Button type="submit" size="icon" className="size-12" loading={loading} disabled={!content.trim()} aria-label="发送消息"><Send className="size-5" /></Button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-slate-400">禁止发送：{SENSITIVE_WORDS.join("、")} 等敏感内容。</p>
      </form>
    </div>
  );
}
