import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { createQueryClient } from './queryClient';
import { applyTheme, useUiStore } from '@/store/ui';
import { Toaster } from '@/components/ui/Toaster';

function ThemeSync() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);
  return null;
}

export function AppProviders({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const queryClient = client ?? defaultClient;
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}

const defaultClient = createQueryClient();
