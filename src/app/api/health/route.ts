import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [schools, trips, users] = await Promise.all([prisma.school.count(), prisma.trip.count(), prisma.user.count()]);
  return NextResponse.json({ ok: true, demo: true, schools, trips, users });
}
