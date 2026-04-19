'use client';

import { useEffect } from 'react';

export default function GuestRestorer() {
  useEffect(() => {
    const guestId = localStorage.getItem('topicshare_guest_id');
    if (!guestId) return;

    fetch('/api/auth/restore-guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId }),
    }).catch(() => {
      // If restore fails (user deleted), clear stored id
      localStorage.removeItem('topicshare_guest_id');
    });
  }, []);

  return null;
}
