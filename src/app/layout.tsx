import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Elgin | Personal Professional Portfolio & Digital Universe",
  description: "Explore Elgin's personal professional portfolio, featuring the Bharat Yatra Smart India Hackathon platform, technical competencies, and Iris AI assistant.",
  keywords: ['Elgin', 'Bharat Yatra', 'Smart India Hackathon', 'Portfolio', 'CSE-AI', 'Developer', 'Iris AI'],
  authors: [{ name: 'Elgin' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="space" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
