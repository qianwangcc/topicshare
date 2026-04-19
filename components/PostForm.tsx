'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PostForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(): Promise<string> {
    const sigRes = await fetch(`/api/upload?topicId=${topicId}`);
    const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

    const form = new FormData();
    form.append('file', imageFile!);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);
    form.append('api_key', apiKey);
    form.append('folder', folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    return data.secure_url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    setUploading(true);
    setError('');

    try {
      let imageUrl: string | null = null;
      if (imageFile) imageUrl = await uploadImage();

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, text: text.trim() || null, imageUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to post');
        return;
      }

      setText('');
      setImageFile(null);
      setImagePreview(null);
      if (fileRef.current) fileRef.current.value = '';
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share a thought..."
        rows={2}
        className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none border-none outline-none"
      />

      {imagePreview && (
        <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-100">
          <Image src={imagePreview} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-gray-400 hover:text-brand-600 text-sm transition-colors"
        >
          📷 Photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="submit"
          disabled={uploading || (!text.trim() && !imageFile)}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          {uploading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
