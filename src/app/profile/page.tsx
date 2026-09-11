import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserProfileCard } from "@/components/user-profile-card";
import { VerificationCard } from "@/components/verification-card";
import { prisma } from "@/lib/prisma";
import { formatDate, parseJsonArray } from "@/lib/utils";
import { Star } from "lucide-react";
import { redirect as redirectTo } from "next/navigation";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");
  const reviews = await prisma.review.findMany({
    where: { revieweeId: user.id },
    include: { reviewer: true, trip: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">个人主页</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">我的 CampusRide 档案</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <UserProfileCard user={user} />
        <div className="space-y-5">
          <VerificationCard email={user.email} verified={user.schoolVerified && user.emailVerified} />
          <Card className="p-5">
            <p className="text-sm font-black text-ink">隐私说明</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">手机号仅展示“已认证”，不会默认公开完整号码。Demo 不收集身份证、银行卡或支付卡信息。</p>
          </Card>
        </div>
      </div>
      <section>
        <h2 className="mb-4 text-xl font-black">近期评价</h2>
        {reviews.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <Card key={review.id} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-ink">{review.reviewer.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{review.trip.origin} → {review.trip.destination} · {formatDate(review.trip.departureAt)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600"><Star className="size-4 fill-current" />{review.rating}.0</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {parseJsonArray(review.tags).map((tag) => <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{tag}</span>)}
                </div>
                {review.comment && <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-slate-500">还没有收到评价。完成一次拼车后，车友可以为你留下可信记录。</Card>
        )}
      </section>
      <form action={async () => {
        "use server";
        const { cookies } = await import("next/headers");
        (await cookies()).delete("campusride_user_id");
        redirectTo("/login");
      }}>
        <button className="text-sm font-semibold text-red-600 hover:text-red-700">退出当前账号</button>
      </form>
    </div>
  );
}
