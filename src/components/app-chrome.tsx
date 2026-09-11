"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, Compass, Home, PlusCircle, UserRound } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { NotificationBell } from "@/components/notification-bell";
import { DemoTimeController } from "@/components/demo-time-controller";

type ChromeUser = { id: string; name: string; avatar?: string | null; isAdmin: boolean } | null;

export function AppChrome({ user, unreadCount, initialTimeOffset, children }: { user: ChromeUser; unreadCount: number; initialTimeOffset: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");

  if (isLogin) return <>{children}</>;

  const navItems = [
    { href: "/", label: "首页", icon: Home },
    { href: "/search", label: "找拼车", icon: Compass },
    { href: "/trips/create", label: "发布", icon: PlusCircle, accent: true },
    { href: "/my-trips", label: "行程", icon: CarFront },
    { href: user ? "/profile" : "/login", label: user ? "我的" : "登录", icon: UserRound },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight text-ink">
            <span className="grid size-9 place-items-center rounded-2xl bg-brand-600 text-white shadow-sm"><CarFront className="size-5" /></span>
            <span>CampusRide</span>
            <span className="hidden rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 sm:inline">DEMO</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/search" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-ink">找拼车</Link>
            <Link href="/my-trips" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-ink">我的行程</Link>
            {user?.isAdmin && <Link href="/admin" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-ink">管理后台</Link>}
          </nav>
          <div className="flex items-center gap-2">
            {user && <NotificationBell initialCount={unreadCount} />}
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-ink shadow-sm">
                <span className="grid size-8 place-items-center rounded-xl bg-brand-100 text-brand-800">{initials(user.name)}</span>
                <span className="hidden max-w-20 truncate sm:inline">{user.name}</span>
              </Link>
            ) : (
              <Link href="/login" className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700">登录</Link>
            )}
          </div>
        </div>
      </header>

      <main className={cn("mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-12", isAdmin && "max-w-7xl")}>{children}</main>

      <nav className="safe-bottom fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-3xl border border-black/5 bg-white/95 px-2 pt-2 shadow-float backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-semibold", active ? "text-brand-700" : "text-slate-400")}>
              <span className={cn("grid size-8 place-items-center rounded-xl", active && "bg-brand-50", item.accent && !active && "bg-ink text-white")}>
                <Icon className="size-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <DemoTimeController initialOffset={initialTimeOffset} />
    </div>
  );
}

