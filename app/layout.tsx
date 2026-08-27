import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'A Nordic Childhood | The Learning Collection',
  description: 'A printable Nordic learning collection for early numbers, letters, meaningful writing, nature, feelings, and quiet courage.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
