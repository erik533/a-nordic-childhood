import type { Metadata } from 'next';
import { Analytics } from './analytics';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'A Nordic Childhood | The Learning Collection',
  description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
  openGraph: {
    title: 'A Nordic Childhood | The Learning Collection',
    description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
    images: [{ url: '/og.png', width: 1731, height: 909 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Nordic Childhood | The Learning Collection',
    description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
