import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import GamingNav from '@/components/GamingNav';

export const metadata: Metadata = {
  title: 'FinLit Academy - Level Up Your Financial Game',
  description: 'Epic financial literacy platform with simulations, AI boss battles, and legendary challenges',
  manifest: '/manifest.json',
  themeColor: '#a855f7',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  keywords: ['financial literacy', 'education', 'budgeting', 'investing', 'personal finance', 'gaming'],
  authors: [{ name: 'FinLit Academy' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://finlit-academy.com',
    title: 'FinLit Academy - Level Up Your Financial Game',
    description: 'Epic financial literacy platform with simulations, AI boss battles, and legendary challenges',
    siteName: 'FinLit Academy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinLit Academy',
    description: 'Level up your financial game',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <GamingNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
