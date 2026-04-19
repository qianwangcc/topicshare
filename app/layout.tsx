import type { Metadata, Viewport } from 'next';
import './globals.css';
import GuestRestorer from '@/components/GuestRestorer';

export const metadata: Metadata = {
  title: 'TopicShare',
  description: 'Share images and thoughts with friends on any topic',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TopicShare',
  },
};

export const viewport: Viewport = {
  themeColor: '#9333ea',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen">
        <GuestRestorer />
        {children}
      </body>
    </html>
  );
}
