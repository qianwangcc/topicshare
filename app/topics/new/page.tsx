'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function NewTopicPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImagePreview(URL.createObjectURL(file));
    const sigRes = await fetch('/api/upload?topicId=covers');
    const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();
    const form = new FormData();
    form.append('file', file);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);
    form.append('api_key', apiKey);
    form.append('folder', folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
    const data = await res.json();
    setCoverImage(data.secure_url);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, coverImage: coverImage || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create topic');
        return;
      }
      const topic = await res.json();
      router.push(`/topics/${topic.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/topics" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold text-gray-900">New Topic</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover image <span className="text-gray-400">(optional)</span></label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-32 rounded-lg border-2 border-dashed border-gray-200 hover:border-brand-300 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden transition-colors"
          >
            {imagePreview ? (
              <Image src={imagePreview} alt="Cover" fill className="object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : '+ Add cover photo'}</span>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Topic title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Japan Trip 2025"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this topic about?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || uploading || !title.trim()}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Creating...' : 'Create Topic'}
        </button>
      </form>
    </div>
  );
}
