// Root layout component
import type { Metadata } from 'next';
import './globals.css';
import { Layout } from '@/components/Layout';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Red Rose Symptom Checker',
  description: 'AI-powered symptom diagnosis application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}

