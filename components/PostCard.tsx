'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CommentSection from './CommentSection';

const EMOJIS = ['❤️', '😂', '🔥', '👍', '😮'];

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: Date | string;
  author: { id: string; name?: string | null; email: string };
}

interface Post {
  id: string;
  text?: string | null;
  imageUrl?: string | null;
  pinned: boolean;
  createdAt: Date | string;
  author: { id: string; name?: string | null; email: string };
  reactions: Reaction[];
  comments: Comment[];
}

export default function PostCard({
  post,
  currentUserId,
  isTopicCreator,
}: {
  post: Post;
  currentUserId: string;
  isTopicCreator: boolean;
}) {
  const router = useRouter();
  const [reactions, setReactions] = useState(post.reactions);
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [pinned, setPinned] = useState(post.pinned);

  const isOwn = post.author.id === currentUserId;
  const authorName = post.author.name ?? post.author.email.split('@')[0];
  const date = new Date(post.createdAt).toLocaleString();

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    await fetch('/api/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    });
    router.refresh();
  }

  async function handleReaction(emoji: string) {
    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, emoji }),
    });
    const data = await res.json();
    if (data.action === 'added') {
      setReactions((prev) => [...prev, { id: Date.now().toString(), emoji, userId: currentUserId }]);
    } else {
      setReactions((prev) => prev.filter((r) => !(r.userId === currentUserId && r.emoji === emoji)));
    }
  }

  async function handlePin() {
    setPinning(true);
    const res = await fetch('/api/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    });
    const data = await res.json();
    setPinned(data.pinned);
    setPinning(false);
    router.refresh();
  }

  // Group reactions by emoji with counts
  const reactionMap = reactions.reduce<Record<string, { count: number; mine: boolean }>>(
    (acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
      acc[r.emoji].count++;
      if (r.userId === currentUserId) acc[r.emoji].mine = true;
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {pinned && (
        <div className="bg-brand-50 px-4 py-1 text-xs text-brand-600 font-medium">📌 Pinned</div>
      )}
      {post.imageUrl && (
        <div className="relative w-full aspect-video bg-gray-100">
          <Image
            src={post.imageUrl}
            alt="Post image"
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        </div>
      )}
      <div className="p-4">
        {post.text && <p className="text-gray-800 text-sm whitespace-pre-wrap mb-3">{post.text}</p>}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-medium text-gray-600">{authorName}</span>
          <div className="flex items-center gap-3">
            <span>{date}</span>
            {isTopicCreator && (
              <button
                onClick={handlePin}
                disabled={pinning}
                className="text-gray-400 hover:text-brand-600 disabled:opacity-50"
              >
                {pinned ? '📌' : '📍'}
              </button>
            )}
            {isOwn && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-400 hover:text-red-600 disabled:opacity-50"
              >
                {deleting ? '...' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        {/* Reaction bar */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {EMOJIS.map((emoji) => {
            const r = reactionMap[emoji];
            return (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full border transition-colors ${
                  r?.mine
                    ? 'bg-brand-50 border-brand-200 text-brand-600'
                    : 'border-gray-200 text-gray-500 hover:border-brand-200 hover:bg-brand-50'
                }`}
              >
                {emoji} {r?.count ? <span className="text-xs">{r.count}</span> : null}
              </button>
            );
          })}
          <button
            onClick={() => setShowComments((v) => !v)}
            className="ml-auto text-xs text-gray-400 hover:text-brand-600 transition-colors"
          >
            💬 {post.comments.length} {showComments ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          initialComments={post.comments}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
