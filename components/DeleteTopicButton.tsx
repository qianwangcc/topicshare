'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteTopicButton({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this topic? This will remove all posts and cannot be undone.')) return;
    setLoading(true);
    const res = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/topics');
    } else {
      alert('Failed to delete topic');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Deleting...' : '🗑 Delete topic'}
    </button>
  );
}
