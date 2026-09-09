import type { Metadata } from 'next';
import { Analytics } from './analytics';
import MetaPixelConsent from './MetaPixelConsent';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'A Nordic Childhood | The Learning Collection',
  description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
  openGraph: {
    title: 'A Nordic Childhood | The Learning Collection',
    description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
    images: [{ url: '/a-nordic-childhood-social-preview-v2.png', width: 1731, height: 909 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Nordic Childhood | The Learning Collection',
    description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
    images: ['/a-nordic-childhood-social-preview-v2.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <MetaPixelConsent />
      </body>
    </html>
  );
}
