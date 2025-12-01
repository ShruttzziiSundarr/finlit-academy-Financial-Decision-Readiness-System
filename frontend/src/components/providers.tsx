'use client';

import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from 'next-themes';
import { apolloClient } from '@/lib/apollo-client';
import { AuthProvider } from '@/hooks/useAuth.tsx';
import Navbar from '@/components/Navbar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}
