import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/review-form";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const user = await requireUser();
  const memberships = await prisma.tripMember.findMany({
    where: { userId: user.id, memberStatus: "ACTIVE", trip: { status: "COMPLETED" } },
    include: {
      trip: {
        include: { members: { where: { memberStatus: "ACTIVE" }, include: { user: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });
  const written = await prisma.review.findMany({ where: { reviewerId: user.id }, select: { tripId: true, revieweeId: true } });
  const completedSet = new Set(written.map((review) => `${review.tripId}:${review.revieweeId}`));
  const pending = memberships.map((membership) => ({
    trip: membership.trip,
    reviewees: membership.trip.members.filter((member) => member.userId !== user.id && !completedSet.has(`${membership.tripId}:${member.userId}`)).map((member) => ({ id: member.userId, name: member.user.name })),
  })).filter((item) => item.reviewees.length);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6"><p className="eyebrow">同行评价</p><h1 className="mt-1 text-3xl font-black tracking-tight">评价你的车友</h1><p className="mt-2 text-sm text-slate-500">评价会影响评分、拼车次数与准时率，帮助你建立可信的校园同行记录。</p></div>
      {pending.length ? (
        <div className="space-y-5">
          {pending.map((item) => (
            <Card key={item.trip.id} className="p-5 sm:p-6">
              <div className="mb-5"><p className="font-black text-ink">{item.trip.origin} → {item.trip.destination}</p><p className="mt-1 text-xs text-slate-500">行程完成于 {formatDateTime(item.trip.departureAt)}</p></div>
              <ReviewForm tripId={item.trip.id} reviewees={item.reviewees} />
            </Card>
          ))}
        </div>
      ) : <EmptyState title="当前没有待评价的行程。" description="完成一次拼车后，你会在这里看到同行车友。" actionLabel="查看我的行程" actionHref="/my-trips" />}
    </div>
  );
}
