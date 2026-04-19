'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinButton({ inviteCode, topicId }: { inviteCode: string; topicId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/topics/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to join');
        return;
      }
      router.push(`/topics/${topicId}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Joining...' : 'Join Topic'}
      </button>
    </div>
  );
}
