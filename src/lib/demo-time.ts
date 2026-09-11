import { cookies } from "next/headers";
import { DEMO_BASE_TIME, DEMO_TIME_COOKIE } from "@/lib/constants";

export async function getDemoOffsetMinutes() {
  const store = await cookies();
  return Number(store.get(DEMO_TIME_COOKIE)?.value ?? 0) || 0;
}

export async function getDemoNow() {
  const offset = await getDemoOffsetMinutes();
  return new Date(new Date(DEMO_BASE_TIME).getTime() + offset * 60_000);
}

export function getDemoNowFromOffset(offset: number) {
  return new Date(new Date(DEMO_BASE_TIME).getTime() + offset * 60_000);
}
