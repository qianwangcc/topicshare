'use client';

import { useEffect, useState } from 'react';

export default function WeChatBanner() {
  const [isWeChat, setIsWeChat] = useState(false);

  useEffect(() => {
    setIsWeChat(/MicroMessenger/i.test(navigator.userAgent));
  }, []);

  if (!isWeChat) return null;

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
      <p className="font-semibold mb-1">请在浏览器中打开</p>
      <p className="text-xs">点击右上角菜单 → 选择「在浏览器打开」，再加入话题。</p>
    </div>
  );
}
