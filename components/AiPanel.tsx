'use client';

import { useState } from 'react';

type Action = 'summarise' | 'generate_post';
type Platform = 'xhs' | 'wechat';

export default function AiPanel({ topicId, postCount }: { topicId: string; postCount: number }) {
  const [action, setAction] = useState<Action>('summarise');
  const [platform, setPlatform] = useState<Platform>('xhs');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setResult('');
    setCopied(false);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, action, platform: action === 'generate_post' ? platform : undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'AI request failed');
        return;
      }
      const data = await res.json();
      setResult(data.result);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-sm text-gray-500">
          Analysing <strong>{postCount} post{postCount !== 1 ? 's' : ''}</strong> in this topic
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">What do you want?</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('summarise')}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                action === 'summarise'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}
            >
              📋 Summarise
            </button>
            <button
              type="button"
              onClick={() => setAction('generate_post')}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                action === 'generate_post'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}
            >
              ✍️ Generate post
            </button>
          </div>
        </div>

        {action === 'generate_post' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlatform('xhs')}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  platform === 'xhs'
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                📕 Xiaohongshu
              </button>
              <button
                type="button"
                onClick={() => setPlatform('wechat')}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  platform === 'wechat'
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                💬 WeChat
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Generating...' : '✨ Generate'}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Result</h3>
            <button
              onClick={handleCopy}
              className="text-xs text-brand-600 border border-brand-100 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full font-medium transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}
