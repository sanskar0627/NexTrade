import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'NexTrade - Demo Trading Platform',
  description: 'Professional demo trading platform for crypto and stocks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <Providers>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}