import Link from 'next/link';

interface Topic {
  id: string;
  title: string;
  description?: string | null;
  createdAt: Date | string;
  creator: { id: string; name?: string | null; email: string };
  _count: { members: number; posts: number };
}

export default function TopicCard({
  topic,
  currentUserId,
}: {
  topic: Topic;
  currentUserId: string;
}) {
  const isOwner = topic.creator.id === currentUserId;
  const creatorName = topic.creator.name ?? topic.creator.email.split('@')[0];

  return (
    <Link
      href={`/topics/${topic.id}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{topic.title}</h2>
          {topic.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{topic.description}</p>
          )}
        </div>
        {isOwner && (
          <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full shrink-0">owner</span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span>👤 {topic._count.members} member{topic._count.members !== 1 ? 's' : ''}</span>
        <span>📝 {topic._count.posts} post{topic._count.posts !== 1 ? 's' : ''}</span>
        <span className="ml-auto">by {creatorName}</span>
      </div>
    </Link>
  );
}
