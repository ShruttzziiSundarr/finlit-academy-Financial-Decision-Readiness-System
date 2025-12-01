import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinLit Academy - Master Your Financial Future',
  description: 'Learn financial literacy through interactive simulations, AI-powered coaching, and gamified challenges',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  keywords: ['financial literacy', 'education', 'budgeting', 'investing', 'personal finance'],
  authors: [{ name: 'FinLit Academy' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://finlit-academy.com',
    title: 'FinLit Academy - Master Your Financial Future',
    description: 'Learn financial literacy through interactive simulations and AI-powered coaching',
    siteName: 'FinLit Academy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinLit Academy',
    description: 'Learn financial literacy through interactive simulations',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
