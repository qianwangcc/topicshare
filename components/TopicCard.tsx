import Link from 'next/link';
import Image from 'next/image';

interface Topic {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  createdAt: Date | string;
  creator: { id: string; name?: string | null; email: string };
  _count: { members: number; posts: number };
  lastPostAt?: Date | string | null;
}

function timeAgo(date: Date | string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {topic.coverImage && (
        <div className="relative w-full h-28 bg-gray-100">
          <Image src={topic.coverImage} alt="Cover" fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
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
          <span>👤 {topic._count.members}</span>
          <span>📝 {topic._count.posts}</span>
          {topic.lastPostAt && (
            <span className="text-brand-400">● {timeAgo(topic.lastPostAt)}</span>
          )}
          <span className="ml-auto">by {creatorName}</span>
        </div>
      </div>
    </Link>
  );
}
