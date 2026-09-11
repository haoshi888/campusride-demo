import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listMessages } from "@/services/chatService";
import { getTripById } from "@/services/tripService";
import { ChatPanel } from "@/components/chat-panel";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ tripId: string }> }) {
  const user = await requireUser();
  const { tripId } = await params;
  const trip = await getTripById(tripId);
  if (!trip) notFound();
  const messages = (await listMessages(tripId)).map((message) => ({ ...message, createdAt: message.createdAt.toISOString() }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/trips/${tripId}`} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft className="size-4" />返回行程详情</Link>
      <div className="mb-5"><p className="eyebrow">站内聊天</p><h1 className="mt-1 text-2xl font-black">{trip.origin} → {trip.destination}</h1><p className="mt-1 text-sm text-slate-500">仅展示行程沟通所需信息，不提供联系方式交换工具。</p></div>
      <ChatPanel tripId={tripId} currentUserId={user.id} initialMessages={messages} />
    </div>
  );
}

