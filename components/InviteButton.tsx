'use client';

import { useState } from 'react';

export default function InviteButton({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-brand-600 border border-brand-100 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full font-medium transition-colors"
    >
      {copied ? '✓ Copied!' : '🔗 Invite friends'}
    </button>
  );
}
