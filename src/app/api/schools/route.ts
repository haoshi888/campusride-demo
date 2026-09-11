import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ ok: true, schools });
}
