import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://a-nordic-childhood-prototype.erikastrand.chatgpt.site'),
  title: 'A Nordic Childhood | The Learning Collection',
  description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
  openGraph: {
    title: 'A Nordic Childhood | The Learning Collection',
    description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
    images: [{ url: 'https://a-nordic-childhood-prototype.erikastrand.chatgpt.site/og.png', width: 1728, height: 909 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Nordic Childhood | The Learning Collection',
    description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
    images: ['https://a-nordic-childhood-prototype.erikastrand.chatgpt.site/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
