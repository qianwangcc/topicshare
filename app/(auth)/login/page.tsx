'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/topics';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to send email');
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">TopicShare</h1>
          <p className="text-gray-500 mt-2">Share moments with friends</p>
        </div>

        {sent ? (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="font-semibold text-gray-800 mb-1">Check your email</h2>
            <p className="text-gray-500 text-sm">
              We sent a login link to <strong>{email}</strong>. It expires in 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Send login link'}
            </button>
            <p className="text-xs text-gray-400 text-center">No password needed. We email you a one-click login link.</p>
          </form>
        )}
      </div>
    </div>
  );
}
