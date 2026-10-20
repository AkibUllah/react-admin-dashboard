import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { signFakeJwt } from '@/mocks/token';
import { testDb } from './server';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
}

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  client?: QueryClient;
}

export function renderWithProviders(ui: ReactElement, { route = '/', client = createTestQueryClient(), ...options }: Options = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  return { client, ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** Put a valid session in the auth store so guarded pages and API calls work. */
export function signIn(): void {
  const user = testDb.users[0];
  if (!user) throw new Error('test database has no users');
  useAuthStore.getState().setSession(signFakeJwt(user), user);
}
