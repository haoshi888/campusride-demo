import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { AppChrome } from "@/components/app-chrome";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDemoOffsetMinutes } from "@/lib/demo-time";

export const metadata: Metadata = {
  title: {
    default: "CampusRide｜校园同校拼车",
    template: "%s｜CampusRide",
  },
  description: "面向高校学生返校与离校场景的同校优先拼车撮合平台。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f7f5",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const initialTimeOffset = await getDemoOffsetMinutes();
  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  return (
    <html lang="zh-CN">
      <body>
        <AppChrome user={user} unreadCount={unreadCount} initialTimeOffset={initialTimeOffset}>
          {children}
        </AppChrome>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

