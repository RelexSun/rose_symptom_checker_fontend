// Providers component to wrap the app with NextAuth SessionProvider and I18n
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n/context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <SessionProvider>{children}</SessionProvider>
    </I18nProvider>
  );
}

