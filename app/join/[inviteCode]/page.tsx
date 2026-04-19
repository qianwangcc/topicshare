import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import JoinForm from '@/components/JoinForm';

export default async function JoinPage({ params }: { params: { inviteCode: string } }) {
  const topic = await prisma.topic.findUnique({
    where: { inviteCode: params.inviteCode },
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { members: true } },
    },
  });

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-800">Invalid invite link</h1>
          <p className="text-gray-500 text-sm mt-2">This invite link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  // If already logged in, auto-join and redirect
  const session = await getSession();
  if (session) {
    await prisma.topicMember.upsert({
      where: { topicId_userId: { topicId: topic.id, userId: session.userId } },
      create: { topicId: topic.id, userId: session.userId },
      update: {},
    });
    redirect(`/topics/${topic.id}`);
  }

  const creatorName = topic.creator.name ?? topic.creator.email.split('@')[0];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{topic.title}</h1>
        <p className="text-sm text-gray-500 mb-1">
          Created by <span className="font-medium">{creatorName}</span>
        </p>
        <p className="text-sm text-gray-400 mb-6">
          {topic._count.members} member{topic._count.members !== 1 ? 's' : ''}
          {topic.description ? ` · ${topic.description}` : ''}
        </p>
        <p className="text-sm text-gray-600 mb-4 font-medium">Enter your name to join</p>
        <JoinForm inviteCode={params.inviteCode} topicId={topic.id} />
      </div>
    </div>
  );
}
