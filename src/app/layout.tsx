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
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}