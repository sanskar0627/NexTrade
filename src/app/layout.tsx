import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}