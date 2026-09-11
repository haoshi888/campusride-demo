import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback = "操作失败，请稍后重试。") {
  const message = error instanceof Error && error.message ? error.message : fallback;
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("请求数据格式不正确");
  }
}
