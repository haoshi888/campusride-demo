"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell({ initialCount }: { initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!open) return;
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => undefined);
  }, [open]);

  async function readAll() {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read-all" }) });
    setCount(0);
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  }

  return (
    <div className="relative">
      <Button variant="outline" size="icon" onClick={() => setOpen((value) => !value)} aria-label="通知" className="relative">
        <Bell className="size-5" />
        {count > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">{count > 9 ? "9+" : count}</span>}
      </Button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-black/5 bg-white shadow-float">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <span className="text-sm font-bold">站内通知</span>
            <button onClick={readAll} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700"><CheckCheck className="size-3.5" />全部已读</button>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">暂无通知</p>
            ) : notifications.map((item) => (
              <div key={item.id} className="rounded-2xl p-3 hover:bg-slate-50">
                <div className="flex items-start gap-2">
                  {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />}
                  <div>
                    <p className="text-sm font-bold text-ink">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
