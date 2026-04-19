'use client';

import { useState } from 'react';

export default function SaveAccountBanner() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to save account');
      } else {
        setDone(true);
        localStorage.removeItem('topicshare_guest_id');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
        ✓ Account saved! You can now log in with your email and password.
      </div>
    );
  }

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-amber-800 font-medium">Save your account to log in anytime</p>
        <button onClick={() => setOpen((v) => !v)} className="text-amber-600 hover:underline text-xs ml-2">
          {open ? 'Cancel' : 'Set up'}
        </button>
      </div>
      {open && (
        <form onSubmit={handleSave} className="mt-3 space-y-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password (6+ chars)"
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Saving...' : 'Save account'}
          </button>
        </form>
      )}
    </div>
  );
}
