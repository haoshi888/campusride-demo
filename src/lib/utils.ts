import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function parseJsonNumberArray(value: string | null | undefined): number[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getDateInputValue(date: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(date));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function relativeDepartureLabel(date: Date | string, now: Date) {
  const target = new Date(date);
  const diffMinutes = Math.round((target.getTime() - now.getTime()) / 60000);
  if (diffMinutes < -120) return formatDateTime(target);
  if (diffMinutes < 0) return "行程进行中";
  if (diffMinutes < 60) return `${Math.max(1, diffMinutes)} 分钟后出发`;
  if (diffMinutes < 24 * 60) return `今天 ${formatTime(target)}`;
  return formatDateTime(target);
}

export function initials(name: string) {
  return name.slice(0, 1);
}

export function stripPhone(phone: string) {
  return phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : "";
}

export function safeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
