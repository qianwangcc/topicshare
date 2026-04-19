'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  text?: string | null;
  imageUrl?: string | null;
  createdAt: Date | string;
  author: { id: string; name?: string | null; email: string };
}

export default function PostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
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

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
      </div>
    </div>
  );
}
