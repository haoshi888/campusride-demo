import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { reviewSchema } from "@/lib/validation";
import { submitReview } from "@/services/reviewService";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("请先登录");
    const parsed = reviewSchema.parse(await readJson(request));
    const reviews = await Promise.all(parsed.reviews.map((review) => submitReview({ ...review, tripId: parsed.tripId, reviewerId: user.id })));
    return NextResponse.json({ ok: true, reviews });
  } catch (error) {
    return apiError(error);
  }
}
