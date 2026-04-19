'use client';

import { useState } from 'react';

interface Comment {
  id: string;
  text: string;
  createdAt: Date | string;
  author: { id: string; name?: string | null; email: string };
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: {
  postId: string;
  initialComments: Comment[];
  currentUserId: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, text }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setText('');
    }
    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div className="border-t border-gray-100 px-4 pb-3 pt-2 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2 text-sm">
          <span className="font-medium text-gray-700 shrink-0">
            {c.author.name ?? c.author.email.split('@')[0]}
          </span>
          <span className="text-gray-600 flex-1">{c.text}</span>
          {c.author.id === currentUserId && (
            <button
              onClick={() => handleDelete(c.id)}
              className="text-gray-300 hover:text-red-400 text-xs shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="text-sm text-brand-600 font-medium disabled:opacity-40"
        >
          Post
        </button>
      </form>
    </div>
  );
}
